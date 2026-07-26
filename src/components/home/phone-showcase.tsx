import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { CubeHero } from "@/components/cube/cube-hero";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

import { PhoneFrame } from "./phone-frame";
import { ShowcaseChart } from "./showcase-chart";
import { ShowcaseFaceId } from "./showcase-faceid";
import { ShowcaseList } from "./showcase-list";
import { ShowcaseTabs } from "./showcase-tabs";

interface Slide {
  key: string;
  /** Padding/layout for the slide's content area. */
  className: string;
  render: (active: boolean) => ReactNode;
}

/** The carousel slides, in order. Each renders with `active` when centred. */
const SLIDES: Slide[] = [
  {
    key: "cube",
    className: "flex items-center justify-center px-4 pt-10 pb-20",
    render: (active) => <CubeHero className="w-full" active={active} />,
  },
  {
    key: "chart",
    className: "px-3 pt-12 pb-20",
    render: (active) => <ShowcaseChart active={active} />,
  },
  {
    key: "faceid",
    className: "px-4 pt-10 pb-20",
    render: (active) => <ShowcaseFaceId active={active} />,
  },
  {
    key: "list",
    className: "px-3 pt-12 pb-20",
    render: (active) => <ShowcaseList active={active} />,
  },
];

const COUNT = SLIDES.length;

/**
 * True on touch-primary devices. Swiping is enabled only here; on desktop the
 * glass tab bar is the sole navigation (dragging a pointer felt wrong there).
 */
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

/**
 * The Home hero: an iPhone running a small carousel of app-feature demos on its
 * screen — the 3D Rubik's cube, an animated analytics chart, a Face ID unlock,
 * and content loading into a list.
 *
 * Embla drives the carousel: it loops seamlessly (last → first slides the first
 * in from the right, no other slides flashing past) and keeps every slide
 * mounted, so the cube's WebGL context never tears down. There's no auto-play —
 * navigation is the glass tab bar, plus swiping on touch devices only. Only the
 * centred slide runs its expensive work (the cube's render loop is gated on it).
 */
export const PhoneShowcase = () => {
  const reduced = usePrefersReducedMotion();
  // Read once: pointer type doesn't change within a session in practice.
  const [canSwipe] = useState(isTouchDevice);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    watchDrag: canSwipe,
    duration: reduced ? 0 : 26,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <PhoneFrame className="w-56 max-w-full sm:w-64">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.key}
              className={cn(
                "relative h-full min-w-0 shrink-0 basis-full",
                slide.className,
                // Non-centred slides ignore pointers so a neighbour's canvas
                // can't grab a drag; the centred slide stays interactive.
                i === selected ? "" : "pointer-events-none",
              )}
            >
              {slide.render(i === selected)}
            </div>
          ))}
        </div>
      </div>

      <ShowcaseTabs
        index={selected}
        liveCount={COUNT}
        onSelect={goTo}
        className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2"
      />
    </PhoneFrame>
  );
};
