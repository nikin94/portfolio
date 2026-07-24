import type { Transition, Variants } from "motion/react";

/**
 * Reusable Motion primitives so animations stay consistent across the site.
 * All transforms run on `transform`/`opacity` only (GPU-friendly), and
 * reduced-motion is honoured globally via `<MotionConfig reducedMotion="user">`.
 */

export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
};

/** Parent variant that reveals children one after another. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
