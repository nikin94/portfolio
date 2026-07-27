import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CubeHero } from "@/components/cube/cube-hero";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

import { PhoneFrame } from "./phone-frame";
import { PushToast } from "./push-toast";
import { ShowcaseChart } from "./showcase-chart";
import { ShowcaseFaceId } from "./showcase-faceid";
import { ShowcaseList } from "./showcase-list";
import { ShowcaseTabs } from "./showcase-tabs";

interface Slide {
  key: string;
  /** Padding/layout for the slide's content area. */
  className: string;
  /**
   * Small delay (ms) before this slide's animation begins once it's selected,
   * so it starts as the slide arrives rather than during the slide-in — without
   * waiting for the scroll to fully settle. The cube uses 0 (it renders straight
   * away during the slide-in, so it's already there on arrival).
   */
  startDelayMs: number;
  /** `active` plays the slide; `playKey` remounts it fresh on each entry. */
  render: (active: boolean, playKey: number) => ReactNode;
}

/** The carousel slides, in order. */
const SLIDES: Slide[] = [
  {
    key: "cube",
    className: "flex items-center justify-center px-4 pt-10 pb-20",
    startDelayMs: 0,
    render: (active) => <CubeHero className="w-full" active={active} />,
  },
  {
    key: "chart",
    className: "px-3 pt-8 pb-14",
    startDelayMs: 350,
    render: (active, playKey) => (
      <ShowcaseChart key={playKey} active={active} />
    ),
  },
  {
    key: "faceid",
    className: "px-4 pt-10 pb-20",
    startDelayMs: 300,
    render: (active, playKey) => (
      <ShowcaseFaceId key={playKey} active={active} />
    ),
  },
  {
    key: "list",
    className: "px-3 pt-12 pb-20",
    startDelayMs: 300,
    render: (active, playKey) => <ShowcaseList key={playKey} active={active} />,
  },
];

const COUNT = SLIDES.length;
/** Delay before the push notification drops onto the cube slide (ms). */
const PUSH_DELAY_MS = 1000;
/**
 * How long the phone takes to finish rising into view on the initial page load
 * — the `hero-rise-phone` animation's delay (0.85s) plus its duration (1s).
 * The push pause is offset by this on the first arrival so the timer starts
 * when the device has actually appeared, not while it's still sliding in.
 */
const PHONE_RISE_MS = 1850;

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
 * navigation is the glass tab bar, plus swiping on touch devices only.
 *
 * Enter/exit are driven by three separate signals so slide content is mounted
 * before it arrives and frozen while it leaves:
 *   - `gen[i]` bumps only when slide `i` is *entered*, so it's the React key: the
 *     incoming slide remounts fresh (replays), while the outgoing slide keeps its
 *     key — it's never reset, so it holds its last frame as it slides off-screen.
 *   - `active = i === selected && started`: the outgoing slide loses `active`
 *     immediately (its timers stop → it freezes), and the incoming slide gains it
 *     only after its own `startDelayMs` — the animation begins as it arrives, not
 *     mid-slide-in, without waiting for the full settle.
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
  // Whether the selected slide has passed its start delay and may animate.
  const [started, setStarted] = useState(false);
  // Per-slide entry counter — the React key, bumped only on entry.
  const [gen, setGen] = useState<number[]>(() => SLIDES.map(() => 0));
  const [pushReady, setPushReady] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(false);
  // The phone rises in once, on the initial page load. Tracks whether that has
  // happened so the push pause is offset by the rise only the first time — on
  // later returns to the cube slide the device is already in place.
  const phoneRisenRef = useRef(false);
  // The last index we actually acted on, so late same-index embla events
  // (a `reInit` after mount fires `select` again with the current snap) are
  // ignored: otherwise they'd reset `started` without the arming effect —
  // keyed on `selected` — re-running, leaving the slide stuck un-started.
  const selectedRef = useRef(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      // Only a genuine slide change should reset/replay; ignore same-index
      // reInit/select so `started` never gets stuck false (which would leave
      // the cube's render loop paused on a blank canvas).
      if (idx === selectedRef.current) return;
      selectedRef.current = idx;
      setSelected(idx);
      // Hold off animating the newcomer until its start delay elapses.
      setStarted(false);
      // Remount only the entering slide, so it replays from scratch; the others
      // (including the one leaving) keep their key and their last frame.
      setGen((g) => {
        const next = [...g];
        next[idx] += 1;
        return next;
      });
    };
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Begin the selected slide's animation after its own small delay (0 under
  // reduced motion / for the cube). The async timer avoids a set-state-in-effect.
  useEffect(() => {
    const delay = reduced ? 0 : SLIDES[selected].startDelayMs;
    const id = window.setTimeout(() => setStarted(true), delay);
    return () => window.clearTimeout(id);
  }, [selected, reduced]);

  // Arm the push every time the cube slide (index 0) is entered: it drops in
  // 1.5s later, and re-arms on every return — not just the first render. Leaving
  // the slide (cleanup) resets both flags so the next entry replays cleanly.
  // Under reduced motion there's no timer — `showPush` shows it immediately.
  //
  // On the very first arrival the phone is still rising into view, so the pause
  // is offset by the rise (`PHONE_RISE_MS`) — the timer starts once the device
  // has appeared, not while it's sliding in. Later returns skip the offset.
  useEffect(() => {
    if (selected !== 0) return;
    const offset = phoneRisenRef.current ? 0 : PHONE_RISE_MS;
    phoneRisenRef.current = true;
    const id = reduced
      ? undefined
      : window.setTimeout(() => setPushReady(true), offset + PUSH_DELAY_MS);
    return () => {
      if (id) window.clearTimeout(id);
      setPushReady(false);
      setPushDismissed(false);
    };
  }, [reduced, selected]);

  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onPushClick = useCallback(() => {
    setPushDismissed(true);
    goTo(1);
  }, [goTo]);

  // The toast lives on the cube slide only, until it's tapped. Under reduced
  // motion it's shown as soon as the slide is entered (no arming timer).
  const showPush = selected === 0 && !pushDismissed && (reduced || pushReady);

  return (
    <PhoneFrame className="w-56 max-w-full sm:w-64">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {SLIDES.map((slide, i) => {
            const isSelected = i === selected;
            return (
              <div
                key={slide.key}
                className={cn(
                  "relative h-full min-w-0 shrink-0 basis-full",
                  slide.className,
                  // Only the selected slide is interactive, so a neighbour's
                  // canvas can't grab a drag while it slides past.
                  isSelected ? "" : "pointer-events-none",
                )}
              >
                {slide.render(isSelected && started, gen[i])}
              </div>
            );
          })}
        </div>
      </div>

      {/* Push notification over the cube slide's screen. The wrapper ignores
          pointers so it never blocks the cube; the toast itself re-enables. */}
      <div className="pointer-events-none absolute inset-x-3 top-10 z-40">
        <PushToast
          show={showPush}
          reduced={reduced}
          onClick={onPushClick}
          className="pointer-events-auto"
        />
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
