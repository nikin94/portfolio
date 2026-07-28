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
 * same shared contract as the browser (`src/lib/contact-schema.ts`), drops bots
 * via a honeypot, hand-builds an RFC 5322 message and sends it through
 * Cloudflare Email Routing — no third-party form service.
 */
interface Env {
  /** Email Routing binding (see `send_email` in wrangler.jsonc). */
  SEND_EMAIL: SendEmail;
  /** Static-asset binding for everything this Worker doesn't handle. */
  ASSETS: Fetcher;
}

/** From-address on the Email-Routing-enabled zone; To must be a verified
 *  destination address (both pinned in wrangler.jsonc). */
const FROM = "contact@nikin.dev";
const TO = "nikin1994@gmail.com";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** UTF-8 → base64, so Cyrillic / accented text survives the message body and
 *  headers (contact messages are short, so building the binary string is fine). */
const toBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

/** RFC 2047 encoded-word for a header value, only when it has non-ASCII. */
const encodeHeader = (s: string) =>
  // eslint-disable-next-line no-control-regex
  /[^\x00-\x7f]/.test(s) ? `=?UTF-8?B?${toBase64(s)}?=` : s;

/** Strip CR/LF so a value can never inject extra headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const buildEmail = (v: ContactValues, id: string, date: string) => {
  const name = oneLine(v.name);
  const replyTo = oneLine(v.email);
  const subject = encodeHeader(`Portfolio enquiry from ${name}`);
  const body = `${v.message.trim()}\n\n— ${name} <${replyTo}>\n`;

  return [
    `From: ${encodeHeader("Portfolio")} <${FROM}>`,
    `To: ${TO}`,
    `Reply-To: ${replyTo}`,
    `Message-ID: <${id}@nikin.dev>`,
    `Date: ${date}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    toBase64(body),
  ].join("\r\n");
};

const handleContact = async (request: Request, env: Env) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  // Honeypot: a hidden field real users never fill. Pretend success for bots.
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
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
        ? handleContact(request, env)
        : json({ error: "Method not allowed." }, 405);
    }

    // Anything else this Worker was routed for → serve the static asset.
    return env.ASSETS.fetch(request);
  },
};
