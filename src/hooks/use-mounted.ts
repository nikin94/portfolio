import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` only after the component has mounted on the client.
 * Handy for hydration-safe UI that depends on browser-only state
 * (theme, `window`, media queries).
 *
 * Implemented with `useSyncExternalStore` so the server snapshot is `false`
 * and the client snapshot is `true` — no `setState`-in-effect required.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
