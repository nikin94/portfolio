import { Suspense, lazy, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useInViewport } from "@/hooks/use-in-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { prefersStaticCube } from "@/lib/device";
import { cn } from "@/lib/utils";

import { CubeFallback } from "./cube-fallback";

/**
 * Single import of the WebGL chunk, shared between `lazy()` and `preload()`.
 * The module system caches it, so calling it more than once is a no-op after
 * the first — the second caller just gets the in-flight/settled promise.
 */
const importCubeCanvas = () => import("./cube-canvas");

const CubeCanvas = lazy(importCubeCanvas);

/**
 * Warm the three.js chunk (~240 kB gz) ahead of time so it's already
 * downloading — or done — by the time the cube renders, shrinking the empty
 * gap before the cube appears. Runs during idle time to avoid competing with
 * critical first-paint work.
 */
const preloadCubeCanvas = () => {
  const warm = () => {
    void importCubeCanvas();
  };
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    }
  ).requestIdleCallback;
  if (ric) ric(warm);
  else window.setTimeout(warm, 200);
};

/** Reads capability hints from `navigator`, guarding for non-browser envs. */
const deviceHints = () => {
  if (typeof navigator === "undefined") return {};
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
  };
};

/**
 * The Rubik's cube hero — the signature visual on the Home tab.
 *
 * The wrapper has a *definite* size (`w-72 … sm:w-96` + `aspect-square`) so the
 * absolutely-filled canvas never collapses it.
 *
 * Capable devices render the interactive cube directly — there is no static
 * fallback layered underneath and no cross-fade. The three.js chunk is prefetched
 * on idle as soon as a capable client mounts, so it's usually already in cache by
 * the time the cube renders; while it loads the space is simply empty/transparent
 * (Suspense fallback is `null`, and the canvas clears transparent), so a flat
 * placeholder never flashes in. The cube then plays a short scale-up entrance as
 * it paints, reading as "the cube grows into view" rather than "a flat picture,
 * then a swap".
 *
 * The static fallback is used only where WebGL can't or shouldn't run: the server
 * render / no-JS view, and reduced-motion / low-power devices (which therefore
 * never download three.js).
 */
export const CubeHero = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("200px");
  const canvasWrap = useRef<HTMLDivElement>(null);

  const staticOnly =
    !mounted || prefersStaticCube({ reducedMotion, ...deviceHints() });

  // Prefetch the WebGL chunk once we know this is a capable client, so three.js
  // is already downloading before React reaches the Suspense boundary.
  useEffect(() => {
    if (!staticOnly) preloadCubeCanvas();
  }, [staticOnly]);

  // Hide the canvas the instant the page starts unloading. As the browser tears
  // the page down the WebGL context is lost and the `<canvas>` briefly paints
  // its opaque white backdrop — visible while the old page is still on screen
  // during a reload. Hiding it synchronously (direct DOM write, not React state,
  // so it lands before the unload frame paints) lets the transparent page
  // background show through instead of a white square.
  useEffect(() => {
    const hide = () => {
      if (canvasWrap.current) canvasWrap.current.style.visibility = "hidden";
    };
    window.addEventListener("pagehide", hide);
    window.addEventListener("beforeunload", hide);
    return () => {
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("beforeunload", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={t("Home.cubeLabel")}
      className={cn(
        "relative aspect-square",
        className ?? "w-72 max-w-full sm:w-96",
      )}
    >
      {staticOnly ? (
        <CubeFallback />
      ) : (
        <div ref={canvasWrap} className="absolute inset-0">
          <Suspense fallback={null}>
            <CubeCanvas active={inView} />
          </Suspense>
        </div>
      )}
    </div>
  );
};
