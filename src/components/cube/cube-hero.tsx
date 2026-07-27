import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { t } from "@/i18n/strings";

import { useInViewport } from "@/hooks/use-in-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { prefersStaticCube } from "@/lib/device";
import { cn } from "@/lib/utils";

import { CubeErrorBoundary } from "./cube-error-boundary";
import { CubeFallback } from "./cube-fallback";
import { CubeIntro } from "./cube-intro";

/** The WebGL chunk (three.js lands here) — loaded on demand, client-only. */
const CubeCanvas = lazy(() => import("./cube-canvas"));

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
 * While the three.js chunk loads there's a deliberate intro — a "Build" button
 * that presses itself on a loop (`CubeIntro`), layered on top of the (loading)
 * canvas. Once the live cube paints its first frame it cross-fades away and the
 * cube scales into its place, so the load delay reads as an intentional
 * micro-scene rather than a blank box or a flashing placeholder. The intro is
 * prerendered at rest (no motion) — the server / no-JS view and any
 * pre-hydration paint — and starts pressing only after mount, so there's no
 * `opacity:0`-before-JS and nothing jarring at hydration.
 *
 * The static `CubeFallback` (flat 3×3) is shown *only* when the live cube can't
 * run at all: reduced-motion / low-power devices (detected on mount; they never
 * download three.js), and a WebGL / chunk-load failure caught by
 * `CubeErrorBoundary` — in which case the intro is also dismissed so the
 * fallback isn't hidden beneath it.
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
  // Flips once the live cube has resolved — painted its first frame, or errored
  // out — which fades the intro away. It only ever goes false → true.
  const [cubeResolved, setCubeResolved] = useState(false);

  // Only known on the client (navigator hints + reduced-motion), so it stays
  // false until mount — capable clients render the canvas straight away.
  const staticOnly =
    mounted && prefersStaticCube({ reducedMotion, ...deviceHints() });

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
          {/* Live cube underneath — client-only. On error the boundary swaps in
              the flat fallback and dismisses the intro (via `cubeResolved`). */}
          {mounted && (
            <CubeErrorBoundary
              fallback={<CubeFallback />}
              onError={() => setCubeResolved(true)}
            >
              <div ref={canvasWrap} className="absolute inset-0">
                <Suspense fallback={null}>
                  <CubeCanvas
                    active={inView && active}
                    onReady={() => setCubeResolved(true)}
                  />
                </Suspense>
              </div>
            </CubeErrorBoundary>
          )}

          {/* Build-button intro on top, fading out once the cube resolves.
              Prerendered at rest (SSR / no-JS); presses only after mount. */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              cubeResolved ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            <CubeIntro animate={mounted && !cubeResolved} />
          </div>
        </>
      )}
    </div>
  );
};
