import { motion, type PanInfo } from "motion/react";

import { CubeHero } from "@/components/cube/cube-hero";
import { useCarousel } from "@/hooks/use-carousel";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

import { PhoneFrame } from "./phone-frame";
import { ShowcaseChart } from "./showcase-chart";
import { ShowcaseFaceId } from "./showcase-faceid";
import { ShowcaseList } from "./showcase-list";
import { ShowcaseTabs } from "./showcase-tabs";

const AUTO_MS = 4200;
/** Swipe past this horizontal distance (px) to change slide. */
const SWIPE_THRESHOLD = 45;

/** The carousel slides, in order. Each renders with `active` when centred. */
const SLIDES = [
  {
    key: "cube",
    className: "flex items-center justify-center px-4 pt-10 pb-20",
    render: (active: boolean) => (
      <CubeHero className="w-full" active={active} />
    ),
  },
  {
    key: "chart",
    className: "px-3 pt-12 pb-20",
    render: (active: boolean) => <ShowcaseChart active={active} />,
  },
  {
    key: "faceid",
    className: "px-4 pt-10 pb-20",
    render: (active: boolean) => <ShowcaseFaceId active={active} />,
  },
  {
    key: "list",
    className: "px-3 pt-12 pb-20",
    render: (active: boolean) => <ShowcaseList active={active} />,
  },
];

const COUNT = SLIDES.length;

/**
 * Shortest signed distance from the active slide to slide `i` around the ring,
 * in [-⌊N/2⌋ … ⌈N/2⌉]. Drives each slide's horizontal offset so the track loops:
 * the last slide's neighbour is the first, so advancing past the end slides the
 * first in from the right instead of rewinding through every slide.
 */
const ringOffset = (i: number, active: number) => {
  let d = (((i - active) % COUNT) + COUNT) % COUNT;
  if (d > COUNT / 2) d -= COUNT;
  return d;
};

/**
 * The Home hero: an iPhone running a small carousel of app-feature demos on its
 * screen — the 3D Rubik's cube, an animated analytics chart, a Face ID unlock,
 * and content loading into a list.
 *
 * The carousel loops infinitely: every slide is mounted and positioned by its
 * ring offset, so only the active slide and its two neighbours are ever near the
 * viewport — the far slides sit off-screen and teleport (no transition) rather
 * than sweeping across. It auto-advances (paused on hover / drag / reduced
 * motion) and is driven by the glass tab bar or by swiping. Only the active
 * slide runs its expensive work — the cube's WebGL loop is gated on being
 * centred, and because slides never unmount the cube never tears down.
 */
export const PhoneShowcase = () => {
  const reduced = usePrefersReducedMotion();
  const { index, goTo, setPaused } = useCarousel({
    count: COUNT,
    intervalMs: AUTO_MS,
    enabled: !reduced,
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setPaused(false);
    if (info.offset.x <= -SWIPE_THRESHOLD) goTo(index + 1);
    else if (info.offset.x >= SWIPE_THRESHOLD) goTo(index - 1);
  };

  return (
    <PhoneFrame className="w-56 max-w-full sm:w-64">
      <div
        className="relative h-full w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragSnapToOrigin
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
        >
          {SLIDES.map((slide, i) => {
            const d = ringOffset(i, index);
            const centered = d === 0;
            return (
              <motion.div
                key={slide.key}
                className={cn("absolute inset-0", slide.className)}
                style={{ pointerEvents: centered ? "auto" : "none" }}
                initial={false}
                animate={{ x: `${d * 100}%` }}
                // Off-screen far slides teleport so they never sweep across the
                // viewport; the active slide and its neighbours glide.
                transition={
                  Math.abs(d) >= 2
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 32 }
                }
              >
                {slide.render(centered)}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <ShowcaseTabs
        index={index}
        liveCount={COUNT}
        onSelect={goTo}
        className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2"
      />
    </PhoneFrame>
  );
};
