import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { useKonamiCode } from "@/hooks/use-konami-code";
import { launchShuttleRally, onShuttleRally } from "@/lib/easter-egg-events";

import { Shuttle } from "./shuttle";
import { printConsoleSignature } from "./console-signature";

/**
 * Site-wide easter eggs, mounted once in the root layout:
 * - a styled console greeting for curious devs (fires once),
 * - the Konami code, which launches a badminton shuttle rally,
 * - a shuttle listener so other components (e.g. the About interests) can
 *   launch the same rally.
 *
 * Renders nothing until an effect actually fires, so it's inert during static
 * generation and adds nothing to first paint. Reduced-motion users don't get
 * the flight (it's pure motion), keeping the experience comfortable.
 */
export const EasterEggs = () => {
  const reduceMotion = useReducedMotion();
  const [flights, setFlights] = useState(0);

  const rally = useCallback(() => {
    if (reduceMotion) return;
    setFlights((n) => n + 1);
  }, [reduceMotion]);

  useKonamiCode(launchShuttleRally);

  useEffect(() => {
    printConsoleSignature();
  }, []);

  useEffect(() => onShuttleRally(rally), [rally]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <AnimatePresence>
        {flights > 0 && (
          <motion.div
            key={flights}
            className="text-accent absolute top-0 left-0 h-12 w-12"
            initial={{ x: "-10vw", y: "70vh", rotate: -25, opacity: 0 }}
            animate={{
              x: ["-10vw", "50vw", "110vw"],
              y: ["70vh", "12vh", "70vh"],
              rotate: [-25, 15, 200],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.5, 1] }}
            onAnimationComplete={() => setFlights(0)}
          >
            <Shuttle className="h-full w-full drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
