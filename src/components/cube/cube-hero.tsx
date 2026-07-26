import { motion } from "motion/react";
import { Suspense, lazy, useState } from "react";
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
 * The Rubik's cube hero. Signature interactive visual for the About tab.
 *
 * Renders the static fallback on the server and first client paint (no layout
 * shift, no WebGL server-side), and permanently for reduced-motion / low-power
 * devices — which therefore never download three.js. Capable clients lazy-load
 * the interactive cube; it pauses when scrolled out of view. Lives on the Home
 * tab as the signature visual.
 */
export const CubeHero = () => {
  const { t } = useTranslation();
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>("200px");
  const [ready, setReady] = useState(false);

  const staticOnly =
    !mounted || prefersStaticCube({ reducedMotion, ...deviceHints() });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={t("Home.cubeLabel")}
      className="relative aspect-square w-full max-w-[20rem] sm:max-w-sm"
    >
      {/* Base layer: static fallback. Fades out only once the WebGL cube has
          painted, so there's no placeholder→cube flash. Stays put permanently
          for static-only devices (the canvas never mounts, `ready` stays false). */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      >
        <CubeFallback />
      </motion.div>

      {!staticOnly && (
        <Suspense fallback={null}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.45 }}
          >
            <CubeCanvas active={inView} onReady={() => setReady(true)} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
};
