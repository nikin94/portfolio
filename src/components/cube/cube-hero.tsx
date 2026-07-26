import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";

import { useInViewport } from "@/hooks/use-in-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { prefersStaticCube } from "@/lib/device";

import { CubeFallback } from "./cube-fallback";

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
 * The wrapper has a *definite* size (`w-72 … sm:w-96` + `aspect-square`) so it
 * never collapses when its only child is an absolutely-filled canvas.
 *
 * On the server and the very first client paint we render the static fallback
 * (no WebGL server-side, and it's the no-JS view). Once mounted, capable
 * devices swap straight to the interactive cube — no fallback overlay, no
 * cross-fade. Reduced-motion / low-power devices keep the static cube and never
 * download three.js.
 */
export const CubeHero = () => {
  const { t } = useTranslation();
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("200px");

  const staticOnly =
    !mounted || prefersStaticCube({ reducedMotion, ...deviceHints() });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={t("Home.cubeLabel")}
      className="relative aspect-square w-72 max-w-full sm:w-96"
    >
      {staticOnly ? (
        <CubeFallback />
      ) : (
        <Suspense fallback={null}>
          <CubeCanvas active={inView} />
        </Suspense>
      )}
    </div>
  );
};
