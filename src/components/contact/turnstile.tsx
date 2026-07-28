import { useEffect, useRef } from "react";

import { siteConfig } from "@/config/site";

/** Minimal shape of the global Turnstile API we call (explicit rendering). */
interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Load the Turnstile script once, shared across any mounts. Resolves when the
// global `window.turnstile` is ready to render.
let scriptPromise: Promise<void> | null = null;
const loadTurnstile = () => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
};

// The script sets `window.turnstile` on load, but poll briefly to be safe.
const waitForApi = () =>
  new Promise<TurnstileApi>((resolve, reject) => {
    let tries = 0;
    const tick = () => {
      if (window.turnstile) return resolve(window.turnstile);
      if (++tries > 40) return reject(new Error("Turnstile API unavailable"));
      window.setTimeout(tick, 50);
    };
    tick();
  });

/**
 * Cloudflare Turnstile widget. Renders only when a site key is configured
 * (`siteConfig.turnstileSiteKey`) — otherwise it's a no-op, so the form keeps
 * working on its other anti-abuse layers. Client-only: the script loads and the
 * widget renders in an effect after mount, so the server render / first paint
 * emit nothing. `onToken` receives the verification token (or `null` when it
 * errors or expires); the parent gates submission on it and passes it to the
 * Worker, which verifies it against the paired secret.
 */
export const Turnstile = ({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Keep the latest callback in a ref so the render effect can run once (mount)
  // without re-rendering the widget when the parent re-renders. Updated in its
  // own effect (not during render) to keep the render pure.
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  });

  useEffect(() => {
    const siteKey = siteConfig.turnstileSiteKey;
    const container = ref.current;
    if (!siteKey || !container) return;

    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstile()
      .then(waitForApi)
      .then((api) => {
        if (cancelled) return;
        widgetId = api.render(container, {
          sitekey: siteKey,
          callback: (token) => cb.current(token),
          "error-callback": () => cb.current(null),
          "expired-callback": () => cb.current(null),
          theme: "dark",
        });
      })
      .catch(() => cb.current(null));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  if (!siteConfig.turnstileSiteKey) return null;
  return <div ref={ref} className="mt-4" />;
};
