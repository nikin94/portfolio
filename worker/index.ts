import { EmailMessage } from "cloudflare:email";

import {
  MESSAGE_MAX,
  NAME_MAX,
  validateContact,
  type ContactValues,
} from "../src/lib/contact-schema";

/**
 * The Worker that fronts the static site. Cloudflare serves the prerendered
 * `dist/` assets directly; `run_worker_first: ["/api/*"]` (see wrangler.jsonc)
 * routes only `/api/*` here. Everything else — and any `/api` path this handler
 * doesn't own — falls through to `env.ASSETS`, so the site is unaffected.
 *
 * `POST /api/contact` is the contact form's backend: it validates against the
 * same shared contract as the browser (`src/lib/contact-schema.ts`), rejects
 * abuse (same-origin only, per-IP rate limit, optional Turnstile verification,
 * honeypot + submit-timing), then hand-builds an RFC 5322 message and sends it
 * through Cloudflare Email Routing — no third-party form service.
 */

/** Minimal shape of the Workers Rate Limiting binding (`unsafe` ratelimit),
 *  declared locally so the Worker doesn't depend on the binding's generated
 *  types being present. */
interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  /** Email Routing binding (see `send_email` in wrangler.jsonc). */
  SEND_EMAIL: SendEmail;
  /** Static-asset binding for everything this Worker doesn't handle. */
  ASSETS: Fetcher;
  /** Per-IP rate limiter for the contact endpoint (see `unsafe` in
   *  wrangler.jsonc). Optional so a missing binding degrades to "no limit"
   *  rather than a 500. */
  CONTACT_RATE_LIMITER?: RateLimiter;
  /** Cloudflare Turnstile secret (a Worker secret, not in wrangler.jsonc). When
   *  set, the endpoint verifies the widget token before sending; when unset,
   *  Turnstile is simply off and the other guards still apply. */
  TURNSTILE_SECRET?: string;
}

/** From-address on the Email-Routing-enabled zone; To must be a verified
 *  destination address (both pinned in wrangler.jsonc). */
const FROM = "contact@nikin.dev";
const TO = "nikin1994@gmail.com";

/** Reject a submission that arrives sooner than this after the form mounted —
 *  a human can't fill three fields that fast, so it reads as an auto-submit. */
const MIN_FILL_MS = 1500;
/** Hard cap on the request body so a large payload can't burn Worker CPU before
 *  the per-field limits ever apply. Real submissions are a few KB. */
const MAX_BODY_BYTES = 64 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** UTF-8 → base64, so Cyrillic / accented text survives the message body
 *  (contact messages are short, so building the binary string is fine). */
const toBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

/** Fold a base64 payload to 76-char lines (RFC 2045), joined with CRLF, so no
 *  single line exceeds the SMTP 998-octet limit and long messages deliver
 *  intact instead of being truncated or spam-filed. */
const foldBase64 = (b64: string) =>
  (b64.match(/.{1,76}/g) ?? [b64]).join("\r\n");

/** Strip CR/LF so a value can never inject extra headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const buildEmail = (v: ContactValues, id: string, date: string) => {
  const name = oneLine(v.name);
  const replyTo = oneLine(v.email);
  const body = `${v.message.trim()}\n\n— ${name} <${replyTo}>\n`;

  return [
    // A fixed ASCII subject — the sender's name (possibly non-ASCII) lives in
    // the body, so the header never needs an RFC 2047 encoded-word (which is
    // capped at 75 chars and would garble long / Cyrillic names).
    `From: Portfolio <${FROM}>`,
    `To: ${TO}`,
    `Reply-To: ${replyTo}`,
    `Message-ID: <${id}@nikin.dev>`,
    `Date: ${date}`,
    "Subject: New portfolio enquiry",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    foldBase64(toBase64(body)),
  ].join("\r\n");
};

/** Same-origin guard: accept the POST only when the browser's `Origin` (or, as
 *  a fallback, `Referer`) matches this deployment's own origin. Blocks
 *  cross-site scripted posts while still working on prod and preview URLs. */
const isSameOrigin = (request: Request, self: string) => {
  const origin = request.headers.get("Origin");
  if (origin) return origin === self;
  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      return new URL(referer).origin === self;
    } catch {
      return false;
    }
  }
  // A browser always sends Origin on a cross-origin-capable POST; its absence
  // means a non-browser client, which this endpoint doesn't serve.
  return false;
};

/** Verify a Turnstile token against Cloudflare's siteverify API. Returns true
 *  only on a confirmed human; any error / missing token is a rejection. */
const verifyTurnstile = async (
  token: string,
  secret: string,
  ip: string | null,
) => {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
};

const handleContact = async (
  request: Request,
  env: Env,
  selfOrigin: string,
) => {
  if (!isSameOrigin(request, selfOrigin)) {
    return json({ error: "Forbidden." }, 403);
  }

  // Require a declared body size within the cap. A browser `fetch` with a JSON
  // string body always sets Content-Length; a missing / unparseable header (a
  // chunked upload with no length) would otherwise read as 0, slip past this
  // guard, and let `request.json()` buffer an unbounded body — so reject it up
  // front rather than trusting the size check to the per-field slices below.
  const declaredLen = Number(request.headers.get("Content-Length"));
  if (!Number.isFinite(declaredLen) || declaredLen <= 0) {
    return json({ error: "Length required." }, 411);
  }
  if (declaredLen > MAX_BODY_BYTES) {
    return json({ error: "Payload too large." }, 413);
  }

  // Per-IP rate limit. Optional binding, so a misconfig degrades to "no limit"
  // (the same-origin + honeypot guards still apply) rather than a hard failure.
  if (env.CONTACT_RATE_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: ip });
    if (!success) return json({ error: "Too many requests." }, 429);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  // Turnstile: only enforced when the secret is configured, so the endpoint
  // degrades gracefully to its other guards until Turnstile is wired up. A
  // missing / invalid token is a hard 403 (unlike the silent honeypot, this is
  // a real challenge the browser widget already passed).
  if (env.TURNSTILE_SECRET) {
    const token =
      typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
    const ip = request.headers.get("CF-Connecting-IP");
    if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET, ip))) {
      return json({ error: "Verification failed." }, 403);
    }
  }

  // Anti-spam, both silently "successful" so a bot learns nothing:
  //  - honeypot: a hidden field only automated fillers touch;
  //  - timing: a genuine submit can't happen within MIN_FILL_MS of mount. A
  //    missing/na elapsed is NOT treated as a bot, so a client hiccup can never
  //    silently drop a real person — the honeypot + origin guards still stand.
  if (
    typeof payload.url_extra === "string" &&
    payload.url_extra.trim() !== ""
  ) {
    return json({ ok: true });
  }
  const elapsed = Number(payload.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
    return json({ ok: true });
  }

  const values: ContactValues = {
    name: String(payload.name ?? "").slice(0, NAME_MAX + 1),
    email: String(payload.email ?? "").slice(0, 320),
    message: String(payload.message ?? "").slice(0, MESSAGE_MAX + 1),
  };

  if (Object.keys(validateContact(values)).length) {
    return json({ error: "Please check the form and try again." }, 422);
  }

  try {
    const raw = buildEmail(
      values,
      crypto.randomUUID(),
      new Date().toUTCString(),
    );
    await env.SEND_EMAIL.send(new EmailMessage(FROM, TO, raw));
    return json({ ok: true });
  } catch {
    return json({ error: "Could not send the message." }, 502);
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return request.method === "POST"
        ? handleContact(request, env, url.origin)
        : json({ error: "Method not allowed." }, 405);
    }

    // Anything else this Worker was routed for → serve the static asset.
    return env.ASSETS.fetch(request);
  },
};
