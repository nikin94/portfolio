import { motion, type PanInfo } from "motion/react";

import { CubeHero } from "@/components/cube/cube-hero";
import { useCarousel } from "@/hooks/use-carousel";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { PhoneFrame } from "./phone-frame";
import { ShowcaseChart } from "./showcase-chart";
import { ShowcaseTabs } from "./showcase-tabs";

/** Slides that are actually built and drive the carousel (cube + chart). */
const LIVE_SLIDES = 2;
const AUTO_MS = 4200;
/** Swipe past this horizontal distance (px) to change slide. */
const SWIPE_THRESHOLD = 45;

/**
 * The Home hero: an iPhone running a small carousel of app-feature demos on its
 * screen. Slide 1 is the 3D Rubik's cube, slide 2 an animated analytics chart;
 * a Face ID unlock and push/skeleton demos land later behind their preview tabs.
 *
 * The carousel auto-advances (paused on hover / drag / reduced-motion), and can
 * be driven by the glass tab bar or by swiping the screen. Only the active slide
 * runs its expensive work — the cube's WebGL loop is gated on being on-screen.
 */
export const PhoneShowcase = () => {
  const reduced = usePrefersReducedMotion();
  const { index, goTo, setPaused } = useCarousel({
    count: LIVE_SLIDES,
    intervalMs: AUTO_MS,
    enabled: !reduced,
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setPaused(false);
    if (info.offset.x <= -SWIPE_THRESHOLD) goTo(index + 1);
    else if (info.offset.x >= SWIPE_THRESHOLD) goTo(index - 1);
  };

  const slideStyle = { width: `${100 / LIVE_SLIDES}%` };

  return (
    <PhoneFrame className="w-56 max-w-full sm:w-64">
      <div
        className="relative h-full w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex h-full"
          style={{ width: `${LIVE_SLIDES * 100}%` }}
          animate={{ x: `${(-100 / LIVE_SLIDES) * index}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragSnapToOrigin
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
        >
          <div
            style={slideStyle}
            className="flex items-center justify-center px-4 pt-10 pb-20"
          >
            <CubeHero className="w-full" active={index === 0} />
          </div>
          <div style={slideStyle} className="px-3 pt-12 pb-20">
            <ShowcaseChart active={index === 1} />
          </div>
        </motion.div>
      </div>

      <ShowcaseTabs
        index={index}
        liveCount={LIVE_SLIDES}
        onSelect={goTo}
        className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2"
      />
    </PhoneFrame>
  );
};
