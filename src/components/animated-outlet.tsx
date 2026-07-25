import { motion } from "motion/react";
import { Outlet, useLocation } from "react-router-dom";

import { useMounted } from "@/hooks/use-mounted";
import { easeOutExpo } from "@/lib/motion";

/**
 * Wraps the routed page in an app-like enter transition, re-keyed per path so
 * each tab switch animates in fresh.
 *
 * The first paint (server render + hydration) skips `initial` so the
 * pre-rendered content is immediately visible — no opacity-0 flash before JS,
 * and no hydration mismatch. Only navigations that happen after mount animate.
 * Reduced-motion users get no transform (honoured globally by `MotionConfig`).
 */
export const AnimatedOutlet = () => {
  const { pathname } = useLocation();
  const mounted = useMounted();

  return (
    <motion.div
      key={pathname}
      initial={mounted ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      className="flex flex-1 flex-col"
    >
      <Outlet />
    </motion.div>
  );
};
