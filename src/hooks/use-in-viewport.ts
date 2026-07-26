import { useEffect, useRef, useState } from "react";

/**
 * Observes an element and reports whether it is currently in the viewport.
 * Used to pause the WebGL render loop when the hero scrolls out of view so it
 * stops spending GPU/battery off-screen.
 *
 * Defaults to `true` so the server render and the first client paint keep the
 * hero active; the observer then corrects it. `setState` lives in the observer
 * callback (an external subscription), not synchronously in the effect body.
 */
export const useInViewport = <T extends Element>(rootMargin = "0px") => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
};
