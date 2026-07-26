import { useLenis } from "lenis/react";
import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Layout effect before paint on the client (so the reset never flashes the old
// scroll position), plain effect on the server (where layout effects warn).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Resets the scroll position to the top on every route change. React Router
 * keeps the window scroll where it was across navigations, so without this a
 * new page (e.g. a project case study) would open already scrolled down.
 *
 * Lenis owns the scroll in `root` mode, so we reset through it (`immediate`, no
 * smooth animation); we fall back to `window` for the brief moment before Lenis
 * has mounted. Renders nothing — mounted once in the root layout, so it covers
 * every page.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useIsomorphicLayoutEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
};
