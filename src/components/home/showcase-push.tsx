import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

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

const SKELETON_CARDS = [0, 1, 2];

/**
 * Slide 4 of the phone showcase: a push notification drops in from the top,
 * then the screen fills with shimmering skeleton cards — the "notification
 * arrives, content loads" moment every app has. Purely decorative motion.
 *
 * Re-plays whenever the slide becomes active; reduced-motion users get the
 * settled state (toast present, static skeletons). Hidden from assistive tech;
 * the tab bar carries the label.
 */
export const ShowcasePush = ({ active }: { active: boolean }) => {
  const { t } = useTranslation();
  const reduced = usePrefersReducedMotion();
  const play = active && !reduced;

  return (
    <div aria-hidden className="flex h-full flex-col gap-3">
      {/* Push notification toast. */}
      <motion.div
        key={active ? "in" : "out"}
        className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/12 p-2.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)] backdrop-blur-md"
        initial={reduced ? false : { y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 26,
          delay: 0.15,
        }}
      >
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/90">
          <Bell className="size-3.5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-xs font-semibold text-white">
              {t("Home.showcase.push.title")}
            </p>
            <span className="shrink-0 text-[9px] text-white/35">
              {t("Home.showcase.push.now")}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/55">
            {t("Home.showcase.push.body")}
          </p>
        </div>
      </motion.div>

      {/* Content loading in behind it — shimmering skeleton cards. */}
      <div className="flex flex-col gap-2.5">
        {SKELETON_CARDS.map((i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
          >
            <Skeleton className="size-8 shrink-0 rounded-full" animate={play} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-2 w-3/4" animate={play} />
              <Skeleton className="h-2 w-1/2" animate={play} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
