import { motion } from "motion/react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** A loading placeholder bar with a sweeping shimmer highlight. */
const Skeleton = ({
  className,
  animate,
}: {
  className?: string;
  animate: boolean;
}) => (
  <div
    className={`relative overflow-hidden rounded-md bg-white/8 ${className ?? ""}`}
  >
    {animate && (
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
      />
    )}
  </div>
);

const CARDS = [0, 1, 2, 3];

/**
 * Slide 4 of the phone showcase: a content list that loads in. For now it's the
 * shimmering skeleton state — the "content is loading" moment. A follow-up turns
 * the skeletons into real product cards that scroll and get tapped. Decorative,
 * so it's hidden from assistive tech; the tab bar carries the label.
 */
export const ShowcaseList = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  const play = active && !reduced;

  return (
    <div aria-hidden className="flex h-full flex-col gap-2.5">
      {CARDS.map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.12 }}
        >
          <Skeleton className="size-9 shrink-0 rounded-full" animate={play} />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-2 w-3/4" animate={play} />
            <Skeleton className="h-2 w-1/2" animate={play} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
