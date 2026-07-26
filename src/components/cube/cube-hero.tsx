import { motion } from "motion/react";
import { Suspense, lazy, useEffect, useState } from "react";
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
 * The wrapper has a *definite* size (`w-72 … sm:w-96` + `aspect-square`) so its
 * two absolutely-filled layers never collapse it.
 *
 * Smoothing: the static fallback is the base layer and the WebGL canvas fades in
 * on top of it; the fallback only fades out once the cube's first frame is
 * actually painted (`onFirstFrame`, with a safety timeout in case it's missed).
 * The canvas stays fully transparent until then, so a blank/clearing buffer
 * never flashes over the fallback — the two cross-fade only when the cube is up.
 *
 * On the server and the first client paint only the fallback renders (no WebGL
 * server-side, and it's the no-JS view). Reduced-motion / low-power devices keep
 * the static cube permanently and never download three.js.
 */
export const CubeHero = () => {
  const { t } = useTranslation();
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("200px");
  const [painted, setPainted] = useState(false);

  const staticOnly =
    !mounted || prefersStaticCube({ reducedMotion, ...deviceHints() });

  // Safety net: retire the fallback shortly after the cube mounts even if the
  // `onFirstFrame` callback is missed, so we never get stuck cross-faded.
  useEffect(() => {
    if (staticOnly) return;
    const id = setTimeout(() => setPainted(true), 1200);
    return () => clearTimeout(id);
  }, [staticOnly]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={t("Home.cubeLabel")}
      className="relative aspect-square w-72 max-w-full sm:w-96"
    >
      {/* Base layer: static fallback. Held fully opaque and stable until the
          cube's first frame is actually painted, then cross-fades out. Stays put
          for static-only devices (the canvas never mounts, `painted` stays
          false). */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: staticOnly || !painted ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <CubeFallback />
      </motion.div>

      {!staticOnly && (
        <Suspense fallback={null}>
          {/* Canvas opacity is gated on `painted` (not mount): while three.js
              loads and the renderer initialises it stays fully transparent, so a
              blank/black canvas never flashes over the fallback. The moment the
              first frame is ready both layers cross-fade in lockstep. */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: painted ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <CubeCanvas active={inView} onFirstFrame={() => setPainted(true)} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
};
