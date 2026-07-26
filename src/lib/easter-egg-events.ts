/**
 * A minimal, decoupled channel for easter-egg triggers. Any component can fire
 * an effect and the single listener (mounted once in the layout) reacts —
 * no context/provider plumbing, no shared store. Guards `window` so it's a
 * no-op during static generation.
 */
export const SHUTTLE_EVENT = "portfolio:shuttle-rally";

export const launchShuttleRally = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SHUTTLE_EVENT));
};

/** Subscribe to shuttle launches; returns an unsubscribe fn. */
export const onShuttleRally = (handler: () => void) => {
  window.addEventListener(SHUTTLE_EVENT, handler);
  return () => window.removeEventListener(SHUTTLE_EVENT, handler);
};
