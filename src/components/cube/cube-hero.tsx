import { Suspense, lazy, useEffect, useRef } from "react";
import { t } from "@/i18n/strings";

import { useInViewport } from "@/hooks/use-in-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { prefersStaticCube } from "@/lib/device";
import { cn } from "@/lib/utils";

import { CubeErrorBoundary } from "./cube-error-boundary";
import { CubeFallback } from "./cube-fallback";

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
 * There's no placeholder in the loading path. The hero starts empty and the live
 * WebGL cube scales into view once it paints; while the three.js chunk loads the
 * Suspense fallback is `null` (empty, transparent). This is by design: on the
 * Home tab the cube sits inside the phone, which rises in with its own staged
 * entrance (see `home.tsx`), so the phone has arrived and covers the brief empty
 * gap — the cube then streams onto its screen. No flat placeholder ever flashes.
 *
 * The static `CubeFallback` (flat 3×3) is shown *only* when the live cube can't
 * run at all: reduced-motion / low-power devices (detected on mount; they never
 * download three.js), and a WebGL / chunk-load failure caught by
 * `CubeErrorBoundary`.
 *
 * The server render (and any pre-hydration paint) is empty — nothing is
 * prerendered into the hero, so there's no placeholder in the HTML to flash
 * before hydration. The cube is decorative (`role="img"` carries its label), so
 * an empty hero on the no-JS path is acceptable.
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
      {!mounted ? null : staticOnly ? (
        <CubeFallback />
      ) : (
        // Empty while three.js loads (Suspense `null`); the static fallback
        // appears only if the live cube errors out.
        <CubeErrorBoundary fallback={<CubeFallback />}>
          <div ref={canvasWrap} className="absolute inset-0">
            <Suspense fallback={null}>
              <CubeCanvas active={inView && active} />
            </Suspense>
          </div>
        </CubeErrorBoundary>
      )}
    </div>
  );
};
