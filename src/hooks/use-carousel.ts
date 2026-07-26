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
 * Minimal auto-advancing carousel state. The index loops in both directions —
 * auto-play and manual navigation (`goTo` from tabs / swipe) both wrap around
 * the ends, so the last slide leads back to the first without rewinding through
 * everything in between. Auto-play stops when disabled, paused, or there's a
 * single slide. The timer callback is an external tick (not a synchronous
 * effect body), so `setState` there is fine.
 */
export const useCarousel = ({
  count,
  intervalMs = 4000,
  enabled = true,
}: Options) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
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
