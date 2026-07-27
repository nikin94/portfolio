import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { t } from "@/i18n/strings";

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
 * Warm the three.js chunk (~240 kB gz) as soon as we know this is a capable
 * client. The cube is the above-the-fold hero, so the chunk is fetched eagerly
 * (not deferred to idle) — the sooner it lands, the sooner the live cube paints
 * and the shorter the fallback is on screen. It's a separate async chunk, so it
 * never blocks the HTML/critical-CSS first paint; it only starts its own
 * download a beat earlier.
 */
const preloadCubeCanvas = () => {
  void importCubeCanvas();
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
 * On capable devices the static fallback is kept layered *underneath* the WebGL
 * canvas and only fades out once the live cube has painted its first frame. That
 * removes the flash the old direct-swap caused: the prerendered fallback used to
 * be replaced by an empty/transparent canvas the instant the client mounted,
 * then sit blank while the three.js chunk (~240 kB) loaded, then pop the cube in
 * — a visible "fallback → blank → cube" flicker. Now it's a continuous
 * "fallback → cube" cross-fade with no blank gap. The chunk is prefetched
 * eagerly (not on idle) so the live cube lands fast and the fallback's time on
 * screen — plus the crossfade — stays short.
 *
 * The static fallback is the *only* thing rendered where WebGL can't or shouldn't
 * run: the server render / no-JS view, and reduced-motion / low-power devices
 * (which therefore never download three.js).
 */
export const CubeHero = ({
  className,
  active = true,
}: {
  className?: string;
  /** When false (e.g. an off-screen carousel slide), the render loop pauses. */
  active?: boolean;
}) => {
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("200px");
  const canvasWrap = useRef<HTMLDivElement>(null);
  // Flips once the live cube paints, fading the layered fallback out.
  const [cubeReady, setCubeReady] = useState(false);

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
  //
  // Only `pagehide` — it covers the same unload/reload path (and bfcache/mobile)
  // without the `beforeunload` listener, which disqualifies the page from the
  // browser's back/forward cache and would make every back navigation slower
  // than the flash it prevents.
  useEffect(() => {
    const hide = () => {
      if (canvasWrap.current) canvasWrap.current.style.visibility = "hidden";
    };
    window.addEventListener("pagehide", hide);
    return () => window.removeEventListener("pagehide", hide);
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
        <>
          {/* Fallback stays underneath and fades out only once the live cube
              has painted — no blank gap, no flash swapping to an empty canvas. */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              cubeReady ? "opacity-0" : "opacity-100",
            )}
          >
            <CubeFallback />
          </div>
          <div ref={canvasWrap} className="absolute inset-0">
            <Suspense fallback={null}>
              <CubeCanvas
                active={inView && active}
                onReady={() => setCubeReady(true)}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};
