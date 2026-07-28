import NumberFlow from "@number-flow/react";
import { TrendingUp } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * The chart is a conveyor of evenly-spaced points. `xAt` maps a series index to
 * an x in SVG space: index 0 is a buffer one slot off the left (scrolls out),
 * index `N-2` sits on the right edge (the newest visible reading), and index
 * `N-1` is the incoming point one slot off the right, sliding in.
 */
const SLOT = 50;
/** Points held in the series: 1 off-left buffer + visible span + 1 incoming. */
const N = 9;
const VB_W = 300;
const VB_H = 220;
const BOTTOM = 206;
/** y band (SVG space — smaller y is higher on screen). */
const Y_HI = 22;
const Y_LO = 188;

const xAt = (i: number) => (i - 1) * SLOT; // -50, 0, 50 … 350
/** Screen x of the right edge — where the breathing endpoint is pinned. */
const RIGHT = xAt(N - 2); // 300

/** A gently rising starter shape so the first draw already reads as real data. */
const INITIAL_Y = [196, 172, 150, 118, 130, 92, 70, 44, 24];

const GRID_Y = [30, 75, 120, 165, 210];
const DRAW_SECONDS = 1.7;
/** Time to scroll one slot left — also the cadence at which a new reading (and
 *  a headline roll) arrives. The scroll runs continuously at this speed. */
const ROLL_SECONDS = 2.8;

/** Headline stays within a believable band rather than climbing forever. */
const GROWTH_LO = 142;
const GROWTH_HI = 150;
const VALUE_LO = 46;
const VALUE_HI = 50;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Next reading: a bounded random walk, so the line stays lively and in view. */
const nextY = (prev: number) =>
  clamp(prev + (Math.random() - 0.5) * 80, Y_HI, Y_LO);

/** Headline figures drift inside their band on each new reading. */
const nextGrowth = (g: number) =>
  clamp(Math.round(g + (Math.random() * 4 - 2)), GROWTH_LO, GROWTH_HI);
const nextValue = (v: number) =>
  clamp(
    Math.round((v + (Math.random() - 0.5) * 2.2) * 10) / 10,
    VALUE_LO,
    VALUE_HI,
  );

/** Catmull-Rom → cubic bezier control ys for the segment starting at index `i`. */
const segCtrl = (ys: number[], i: number) => {
  const y0 = ys[i - 1] ?? ys[i];
  const y1 = ys[i];
  const y2 = ys[i + 1];
  const y3 = ys[i + 2] ?? y2;
  return {
    y1,
    y2,
    c1: y1 + (y2 - y0) / 6,
    c2: y2 - (y3 - y1) / 6,
  };
};

/** Catmull-Rom → cubic bezier, for a smooth curve through every point. */
const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(" ");
};

const lineD = (ys: number[]) => smoothPath(ys.map((y, i) => [xAt(i), y]));
const areaD = (ys: number[]) =>
  `${lineD(ys)} L ${xAt(ys.length - 1)},${BOTTOM} L ${xAt(0)},${BOTTOM} Z`;

/**
 * Curve y at a local x. Because the points are evenly spaced, the x-bezier of
 * each segment is exactly linear, so `t` is just the fractional position within
 * the slot — and evaluating the same Catmull-Rom y-bezier gives the exact height
 * of the drawn line. Used to keep the pinned endpoint sitting on the line as the
 * conveyor scrolls beneath it.
 */
const yAtX = (ys: number[], x: number) => {
  const cx = clamp(x, xAt(0), xAt(ys.length - 1));
  const i = clamp(Math.floor((cx - xAt(0)) / SLOT), 0, ys.length - 2);
  const t = (cx - xAt(i)) / SLOT;
  const { y1, y2, c1, c2 } = segCtrl(ys, i);
  const u = 1 - t;
  return (
    u * u * u * y1 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * y2
  );
};

const VALUE_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

/**
 * The chart draw itself. Kept as an inner component so the parent can remount it
 * (via `key`) whenever the slide becomes active — that replays from scratch
 * without resetting state inside an effect.
 *
 * The line first draws itself left-to-right (a single `progress` MotionValue
 * drives it and the counting headline). Once it reaches the top it starts
 * scrolling: the whole line slides left at a constant speed, as if an
 * already-built chart is running in from the right — the offset loops one slot
 * and, on each loop, the series commits (drop the oldest, append a fresh
 * reading) while the offset snaps back, so the motion is seamless and never
 * stutters. The glowing endpoint stays pinned to the right edge, riding the
 * incoming curve. The headline figures roll (via `NumberFlow`) within a
 * believable band on each new reading. Reduced-motion users get the finished
 * chart at rest.
 */
const ChartSlide = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const [series, setSeries] = useState<number[]>(INITIAL_Y);
  const progress = useMotionValue(reduced ? 1 : 0);
  // Leftward conveyor offset (0 → -SLOT), looping; reset the instant a new
  // reading commits so the scroll is continuous, not stepped.
  const shiftX = useMotionValue(0);
  const lineRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGGElement>(null);
  const endRef = useRef<SVGGElement>(null);
  const lineLength = useRef<number | null>(null);
  // Flips true once the intro draw completes (or immediately under reduced
  // motion), switching the chart from "drawing" into its live scrolling phase.
  const [done, setDone] = useState(reduced);
  // Headline figures once live — animated by NumberFlow on every change.
  const [value, setValue] = useState(48.2);
  const [growth, setGrowth] = useState(146);

  const live = done && !reduced;
  const introLead = !reduced && !done;

  // Draw once the slide is active and mark done when the line reaches the top.
  // The parent remounts this slide on entry, so state already starts fresh.
  useEffect(() => {
    if (reduced || !active) return;
    const controls = animate(progress, 1, {
      duration: DRAW_SECONDS,
      ease: "linear",
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [active, reduced, progress]);

  // Continuous conveyor once live: scroll one slot left at constant speed on an
  // infinite loop. `onRepeat` fires at each slot boundary — the moment the
  // offset loops from -SLOT back to 0 — where we commit the shifted series (drop
  // oldest, append a fresh reading) and roll the headline. The one-slot content
  // shift cancels the offset reset, so there's no visible jump.
  useEffect(() => {
    if (reduced || !done || !active) return;
    const controls = animate(shiftX, -SLOT, {
      duration: ROLL_SECONDS,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
      onRepeat: () => {
        setSeries((s) => [...s.slice(1), nextY(s[s.length - 1])]);
        setValue((v) => nextValue(v));
        setGrowth((g) => nextGrowth(g));
      },
    });
    return () => {
      controls.stop();
      shiftX.jump(0);
    };
  }, [active, done, reduced, shiftX]);

  // Ride the glowing leading dot along the tip while the intro line draws. The
  // path length is measured once (it's static during the draw) and cached, so
  // each frame only runs getPointAtLength, not a fresh geometry recalc.
  useMotionValueEvent(progress, "change", (p) => {
    if (done) return;
    const path = lineRef.current;
    const lead = leadRef.current;
    if (!path || !lead || typeof path.getTotalLength !== "function") return;
    if (lineLength.current === null) lineLength.current = path.getTotalLength();
    const pt = path.getPointAtLength(p * lineLength.current);
    lead.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    lead.style.opacity = p > 0.01 ? "1" : "0";
  });

  // Keep the live endpoint pinned to the right edge, its height following the
  // incoming curve as the conveyor scrolls beneath it. Sampled at the screen
  // right edge, whose local x is `RIGHT - shiftX`.
  useMotionValueEvent(shiftX, "change", (sx) => {
    if (!live) return;
    const end = endRef.current;
    if (!end) return;
    end.setAttribute(
      "transform",
      `translate(${RIGHT} ${yAtX(series, RIGHT - sx)})`,
    );
  });

  // Pin the endpoint for the first live frame (before change events fire) and
  // after each commit, and place the static one for reduced motion.
  useEffect(() => {
    const end = endRef.current;
    if (!end || (!live && !reduced)) return;
    const y = reduced ? series[N - 2] : yAtX(series, RIGHT - shiftX.get());
    end.setAttribute("transform", `translate(${RIGHT} ${y})`);
  }, [live, reduced, series, shiftX]);

  const areaOpacity = useTransform(progress, [0, 0.05, 1], [0, 1, 1]);
  // Headline counts up alongside the intro draw; NumberFlow takes over once live.
  const valueText = useTransform(progress, (p) => (p * 48.2).toFixed(1));
  const growthText = useTransform(progress, (p) => Math.round(p * 146));

  return (
    <div aria-hidden className="flex h-full flex-col gap-6 pt-14">
      <div className="px-1">
        <p className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
          Revenue
        </p>
        <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
          {done ? (
            <NumberFlow
              value={value}
              format={VALUE_FORMAT}
              prefix="$"
              suffix="k"
            />
          ) : (
            <>
              $<motion.span>{valueText}</motion.span>k
            </>
          )}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-400 tabular-nums">
          <TrendingUp className="size-3.5" />
          {done ? (
            <NumberFlow value={growth} prefix="+" suffix="%" trend={1} />
          ) : (
            <span>
              +<motion.span>{growthText}</motion.span>%
            </span>
          )}
          <span className="ml-1 text-white/35">last 8 weeks</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full flex-1"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          {/* Clip the scrolling conveyor to the chart viewport so points sliding
              off either edge never bleed past it. */}
          <clipPath id="chart-viewport">
            <rect x={0} y={0} width={VB_W} height={VB_H} />
          </clipPath>
          <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fixed gridline backdrop — does not scroll with the line. */}
        {GRID_Y.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={VB_W}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            vectorEffect="non-scaling-stroke"
            strokeWidth={1}
          />
        ))}

        {/* The conveyor: area + line slide left together, clipped to the view. */}
        <g clipPath="url(#chart-viewport)">
          <motion.g style={{ x: shiftX }}>
            <motion.path
              d={areaD(series)}
              fill="url(#chart-area)"
              style={{ opacity: areaOpacity }}
            />
            <motion.path
              ref={lineRef}
              d={lineD(series)}
              fill="none"
              stroke="#34d399"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#chart-glow)"
              style={{ pathLength: reduced ? 1 : progress }}
            />
          </motion.g>
        </g>

        {/* Endpoint pinned to the right edge once live/at rest: rides the
            incoming curve, breathing, with a "new reading" ring on a loop. */}
        {(live || reduced) && (
          <g ref={endRef}>
            {live && (
              <motion.circle
                r={5}
                fill="#34d399"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={{ scale: [1, 3], opacity: [0.45, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeOut",
                }}
              />
            )}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              animate={live ? { scale: [1, 1.18, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <circle r={3.5} fill="#ecfdf5" />
              <circle r={3.5} fill="#34d399" opacity={0.5} />
            </motion.g>
          </g>
        )}

        {/* Leading dot that rides the tip while the intro line draws. */}
        {introLead && (
          <g ref={leadRef} style={{ opacity: 0 }}>
            <motion.circle
              r={5}
              fill="#34d399"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              animate={{ scale: [1, 2.6], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
            <circle r={3.5} fill="#ecfdf5" />
            <circle r={3.5} fill="#34d399" opacity={0.5} />
          </g>
        )}
      </svg>
    </div>
  );
};

/**
 * Slide 2 of the phone showcase: an animated analytics chart that draws itself
 * left-to-right, then scrolls live — an already-built line runs in from the
 * right at a constant speed, headline figures rolling within a believable band,
 * the endpoint pinned to the right edge and breathing. Remounted whenever it
 * (de)activates so the draw replays on each visit; reduced-motion users get the
 * finished chart at rest.
 */
export const ShowcaseChart = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <ChartSlide active={active} reduced={reduced} />;
};
