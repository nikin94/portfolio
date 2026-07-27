import { Box } from "lucide-react";
import { motion } from "motion/react";

import { t } from "@/i18n/strings";

/**
 * Loading intro for the WebGL cube: a "Build" button that presses itself on a
 * loop while the three.js chunk downloads, turning the unavoidable load delay
 * into a deliberate micro-scene rather than an empty box or a flashing
 * placeholder. Once the live cube paints, the parent fades this out and the cube
 * scales into its place — reading as "press the button, the cube drops out".
 *
 * `animate` drives the looping press: `false` renders the button at rest, with
 * no motion — the server / no-JS view, and any pre-hydration paint. Decorative,
 * so it's hidden from assistive tech (the hero wrapper carries the real label).
 */
export const CubeIntro = ({ animate }: { animate: boolean }) => (
  <div aria-hidden className="grid size-full place-items-center">
    <motion.div
      className="relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-3 shadow-lg backdrop-blur-sm"
      animate={animate ? { scale: [1, 0.92, 1, 1] } : undefined}
      transition={{
        duration: 1.6,
        times: [0, 0.16, 0.34, 1],
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Ripple launched from each press, radiating out across the button. */}
      {animate && (
        <motion.span
          className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/25"
          animate={{ scale: [0, 0, 2.6], opacity: [0, 0.5, 0] }}
          transition={{
            duration: 1.6,
            times: [0, 0.16, 0.62],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
      <Box className="relative size-5 text-emerald-400" />
      <span className="relative text-sm font-medium text-white">
        {t("Home.cubeBuild")}
      </span>
    </motion.div>
  </div>
);
