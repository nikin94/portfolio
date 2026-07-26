import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const SCAN_MS = 1500;

/** The rounded Face ID reticle brackets (four corners). */
const CORNERS = [
  "M8 26V14a6 6 0 0 1 6-6h12", // top-left
  "M64 26V14a6 6 0 0 0-6-6H46", // top-right
  "M8 46v12a6 6 0 0 0 6 6h12", // bottom-left
  "M64 46v12a6 6 0 0 1-6 6H46", // bottom-right
];

/**
 * The unlock sequence itself. Kept as an inner component so the parent can
 * remount it (via `key`) whenever the slide becomes active — that replays the
 * scan from scratch without resetting state inside an effect. The timer is the
 * only thing that flips `done`; reduced motion skips straight to unlocked.
 */
const FaceIdSlide = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || reduced) return;
    const id = window.setTimeout(() => setDone(true), SCAN_MS);
    return () => window.clearTimeout(id);
  }, [active, reduced]);

  const scanned = reduced || done;

  return (
    <div
      aria-hidden
      className="flex h-full flex-col items-center justify-center gap-6"
    >
      <div className="relative size-40">
        <svg viewBox="0 0 72 72" className="size-full overflow-visible">
          <defs>
            <clipPath id="faceid-reticle">
              <rect x="8" y="8" width="56" height="56" rx="14" />
            </clipPath>
          </defs>

          {/* Reticle corners — emerald once unlocked. */}
          {CORNERS.map((d) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke={scanned ? "#34d399" : "#e5e7eb"}
              strokeWidth={3}
              strokeLinecap="round"
              animate={{ stroke: scanned ? "#34d399" : "#e5e7eb" }}
              transition={{ duration: 0.4 }}
            />
          ))}

          {/* Simple face: eyes + smile. */}
          <g
            stroke={scanned ? "#34d399" : "#d1d5db"}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          >
            <path d="M28 30v4" />
            <path d="M44 30v4" />
            <path d="M29 44c2.4 2.6 5 4 7 4s4.6-1.4 7-4" />
          </g>

          {/* Scan line sweeping the face while scanning. */}
          {!scanned && !reduced && (
            <g clipPath="url(#faceid-reticle)">
              <motion.line
                x1="8"
                x2="64"
                stroke="#34d399"
                strokeWidth={2}
                initial={{ y1: 12, y2: 12, opacity: 0 }}
                animate={{
                  y1: [12, 60, 12],
                  y2: [12, 60, 12],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px #34d399)" }}
              />
            </g>
          )}
        </svg>

        {/* Success check pops over the reticle once unlocked. */}
        <AnimatePresence>
          {scanned && (
            <motion.div
              className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <svg viewBox="0 0 24 24" className="size-5">
                <motion.path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-white">
          {t("Home.showcase.faceid.title")}
        </p>
        <motion.p
          key={scanned ? "done" : "scan"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            scanned
              ? "mt-1 text-xs text-emerald-400"
              : "mt-1 text-xs text-white/40"
          }
        >
          {scanned
            ? t("Home.showcase.faceid.unlocked")
            : t("Home.showcase.faceid.scanning")}
        </motion.p>
      </div>
    </div>
  );
};

/**
 * Slide 3 of the phone showcase: a Face ID unlock. A reticle frames a simple
 * face while a scan line sweeps it; on completion the reticle turns emerald, a
 * success check pops in and the label flips to "unlocked" — the everyday
 * biometric moment of a native app.
 *
 * Re-plays each time the slide becomes active (remounted via `key`); reduced-
 * motion users get the unlocked end state with no scanning. Decorative — hidden
 * from assistive tech; the tab bar carries the label.
 */
export const ShowcaseFaceId = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <FaceIdSlide
      key={active ? "on" : "off"}
      active={active}
      reduced={reduced}
    />
  );
};
