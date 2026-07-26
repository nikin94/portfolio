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
 * The wrapper has a *definite* size (`w-72 … sm:w-96` + `aspect-square`) so the
 * absolutely-filled canvas never collapses it.
 *
 * Capable devices render the interactive cube directly — there is no static
 * fallback layered underneath and no cross-fade. While the three.js chunk loads
 * the space is simply empty/transparent (Suspense fallback is `null`, and the
 * canvas clears transparent), so a flat placeholder never flashes in; the cube
 * then plays a short scale-up entrance as it paints, reading as "the cube grows
 * into view" rather than "a flat picture, then a swap".
 *
 * The static fallback is used only where WebGL can't or shouldn't run: the server
 * render / no-JS view, and reduced-motion / low-power devices (which therefore
 * never download three.js).
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
