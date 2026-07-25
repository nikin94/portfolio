import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  if (typeof matchMedia === "undefined") return () => {};
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getSnapshot = () =>
  typeof matchMedia !== "undefined" && matchMedia(QUERY).matches;

/** The server never knows the preference, so it assumes motion is allowed. */
const getServerSnapshot = () => false;

/**
 * Tracks the user's `prefers-reduced-motion` setting, hydration-safe via
 * `useSyncExternalStore` (no `setState`-in-effect).
 */
export const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
