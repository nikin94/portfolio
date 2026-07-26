import { useCallback, useEffect, useState } from "react";

interface Options {
  /** Number of slides to cycle through. */
  count: number;
  /** Auto-advance interval in ms. */
  intervalMs?: number;
  /** Master switch — set to `false` (e.g. for reduced motion) to stop auto-play. */
  enabled?: boolean;
}

/**
 * Minimal auto-advancing carousel state. The index loops while auto-playing;
 * `goTo` (manual navigation — tabs, swipe) clamps within range instead.
 * Auto-play stops when disabled, paused, or there's a single slide. The timer
 * callback is an external tick (not a synchronous effect body), so `setState`
 * there is fine.
 */
export const useCarousel = ({
  count,
  intervalMs = 4000,
  enabled = true,
}: Options) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(count - 1, i))),
    [count],
  );

  useEffect(() => {
    if (!enabled || paused || count < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [enabled, paused, count, intervalMs]);

  return { index, goTo, paused, setPaused };
};
