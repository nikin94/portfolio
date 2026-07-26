import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

/**
 * An iOS-style push notification banner that drops in from the top of the phone
 * screen. Used on the chart slide: it appears the moment the chart finishes
 * drawing ("your report is ready"). Decorative — hidden from assistive tech.
 */
export const PushToast = ({
  show,
  reduced,
}: {
  show: boolean;
  reduced: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 z-20 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/12 p-2.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)] backdrop-blur-md"
          initial={reduced ? false : { y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
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
      )}
    </AnimatePresence>
  );
};
