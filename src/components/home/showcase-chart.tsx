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
 * Data points for a generally-rising series (y is SVG-space, so smaller = up).
 * Kept slightly wiggly so the uptrend reads as real data, not a straight ramp.
 */
const POINTS: [number, number][] = [
  [10, 196],
  [50, 158],
  [90, 170],
  [130, 118],
  [170, 128],
  [210, 74],
  [250, 62],
  [290, 16],
];
const BOTTOM = 210;
const FIRST_X = POINTS[0][0];
const LAST = POINTS[POINTS.length - 1];
const LAST_X = LAST[0];
const SPAN = LAST_X - FIRST_X;
const VB_H = 220;

/** Weekly bars beneath the line — a denser footer so the slide fills the screen
 *  like the others. Fractions of the bar area's height; the last week peaks. */
const BARS = [0.32, 0.46, 0.4, 0.58, 0.52, 0.7, 0.64, 0.94];

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

const LINE_D = smoothPath(POINTS);
const AREA_D = `${LINE_D} L ${LAST_X},${BOTTOM} L ${FIRST_X},${BOTTOM} Z`;
const GRID_Y = [30, 75, 120, 165, 210];
const DRAW_SECONDS = 1.7;

const xNorm = (x: number) => (x - FIRST_X) / SPAN;

/** A data point that pops in as the reveal sweeps past its x position. */
const DataDot = ({
  point,
  progress,
}: {
  point: [number, number];
  progress: ReturnType<typeof useMotionValue<number>>;
}) => {
  const at = xNorm(point[0]);
  const s = useTransform(progress, [at - 0.001, at + 0.05], [0, 1], {
    clamp: true,
  });
  return (
    <motion.circle
      cx={point[0]}
      cy={point[1]}
      r={3}
      fill="#0a0f0d"
      stroke="#34d399"
      strokeWidth={2}
      style={{
        scale: s,
        opacity: s,
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    />
  );
};

/**
 * The chart draw itself. Kept as an inner component so the parent can remount it
 * (via `key`) whenever the slide becomes active — that replays the draw from
 * scratch without resetting state inside an effect.
 *
 * The line draws left-to-right (a single `progress` MotionValue drives the line,
 * the data dots and the counting headline in lockstep). Once it reaches the top,
 * the chart comes alive rather than freezing:
 *   1. the endpoint keeps breathing (a solid dot with a pulsing halo) and the
 *      headline figure micro-ticks with a slight upward drift;
 *   2. the gradient area pours up under the finished line (bottom-to-top);
 *   3. a "new reading" ring emits from the endpoint on a loop — a live feed.
 * Reduced-motion users get the finished chart at rest, no loops.
 */
const ChartSlide = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const progress = useMotionValue(reduced ? 1 : 0);
  const areaFill = useMotionValue(reduced ? 1 : 0);
  const lineRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGGElement>(null);
  // The path is static, so its length never changes — measure it once and cache.
  const lineLength = useRef<number | null>(null);
  // Flips true once the draw completes (or immediately under reduced motion),
  // switching the chart from "drawing" into its living phase.
  const [done, setDone] = useState(reduced);
  // Small upward-biased drift added to the headline figure while live.
  const [drift, setDrift] = useState(0);

  // Draw once the slide is active; mark done when the line reaches the top.
  // No state reset needed here — the parent remounts this slide (keyed on entry)
  // so `done`/`drift` already start fresh on every visit.
  useEffect(() => {
    if (reduced || !active) return;
    const controls = animate(progress, 1, {
      duration: DRAW_SECONDS,
      ease: "linear",
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [active, reduced, progress]);

  // (2) Pour the area up under the line once the draw finishes.
  useEffect(() => {
    if (reduced || !done) return;
    const controls = animate(areaFill, 1, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [done, reduced, areaFill]);

  // (1) Micro-tick the headline figure while live — a gentle, slightly upward
  //     random walk, clamped so it reads as a live number, not a runaway.
  useEffect(() => {
    if (reduced || !done || !active) return;
    const id = window.setInterval(() => {
      setDrift((d) => {
        const next = d + (Math.random() - 0.4) * 0.3;
        return Math.min(1.3, Math.max(-0.2, next));
      });
    }, 1500);
    return () => window.clearInterval(id);
  }, [done, reduced, active]);

  // Move the glowing leading dot to the exact tip of the drawn line. The path
  // length is computed once (it's static) and cached, so each frame only runs
  // getPointAtLength — not a fresh synchronous getTotalLength geometry recalc.
  useMotionValueEvent(progress, "change", (p) => {
    const path = lineRef.current;
    const lead = leadRef.current;
    if (!path || !lead || typeof path.getTotalLength !== "function") return;
    if (lineLength.current === null) lineLength.current = path.getTotalLength();
    const pt = path.getPointAtLength(p * lineLength.current);
    lead.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    lead.style.opacity = p > 0.01 ? "1" : "0";
  });

  // Pin the endpoint to the last point and keep it visible once the chart is
  // static (post-draw, or immediately under reduced motion where no change
  // events fire) — so the breathing endpoint stays put instead of vanishing.
  useEffect(() => {
    const lead = leadRef.current;
    if (!lead || (!reduced && !done)) return;
    lead.setAttribute("transform", `translate(${LAST[0]} ${LAST[1]})`);
    lead.style.opacity = "1";
  }, [reduced, done]);

  const valueText = useTransform(progress, (p) => (p * 48.2).toFixed(1));
  const growth = useTransform(progress, (p) => Math.round(p * 146));
  const areaH = useTransform(areaFill, (v) => v * VB_H);
  const areaY = useTransform(areaFill, (v) => VB_H - v * VB_H);
  const live = done && !reduced;

  return (
    <div aria-hidden className="flex h-full flex-col justify-between gap-3">
      <div className="px-1">
        <p className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
          Revenue
        </p>
        <p className="mt-0.5 text-2xl font-semibold text-white tabular-nums">
          $
          {done ? (
            (48.2 + drift).toFixed(1)
          ) : (
            <motion.span>{valueText}</motion.span>
          )}
          k
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-400 tabular-nums">
          <TrendingUp className="size-3.5" />+
          {done ? 146 + Math.round(drift * 3) : <motion.span>{growth}</motion.span>}%
          <span className="ml-1 text-white/35">last 8 weeks</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 300 ${VB_H}`}
        className="w-full flex-1 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          {/* (2) Bottom-up clip so the area pours upward after the line draws. */}
          <clipPath id="chart-area-clip">
            <motion.rect x={0} width={300} style={{ y: areaY, height: areaH }} />
          </clipPath>
          <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Gridlines. */}
        {GRID_Y.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={300}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            vectorEffect="non-scaling-stroke"
            strokeWidth={1}
          />
        ))}

        {/* Area, revealed bottom-up once the line is drawn. */}
        <path d={AREA_D} fill="url(#chart-area)" clipPath="url(#chart-area-clip)" />

        {/* The line draws itself left-to-right via pathLength. */}
        <motion.path
          ref={lineRef}
          d={LINE_D}
          fill="none"
          stroke="#34d399"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#chart-glow)"
          style={{ pathLength: reduced ? 1 : progress }}
        />

        {/* Data points pop in as the sweep passes each one. */}
        {POINTS.map((p) => (
          <DataDot key={p[0]} point={p} progress={progress} />
        ))}

        {/* Breathing endpoint (1) with a repeating "new reading" ring (3). */}
        <g ref={leadRef} style={{ opacity: 0 }}>
          {/* (3) Live-feed emit — a ring radiating out from the latest reading. */}
          <motion.circle
            r={5}
            fill="#34d399"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={
              active && !reduced ? { scale: [1, 3], opacity: [0.45, 0] } : {}
            }
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
          />
          {/* (1) The solid endpoint, gently breathing while live. */}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={live ? { scale: [1, 1.18, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <circle r={3.5} fill="#ecfdf5" />
            <circle r={3.5} fill="#34d399" opacity={0.5} />
          </motion.g>
        </g>
      </svg>

      {/* Weekly bars footer — denser content so the slide fills the phone like
          the other demos; they rise in once the line has drawn. */}
      <div className="flex h-9 items-end gap-1.5 px-1">
        {BARS.map((h, i) => (
          <motion.div
            key={i}
            className={`flex-1 origin-bottom rounded-t-sm ${
              i === BARS.length - 1 ? "bg-emerald-400" : "bg-white/15"
            }`}
            style={{ height: `${h * 100}%` }}
            initial={false}
            animate={{ scaleY: reduced || done ? 1 : 0 }}
            transition={{
              duration: 0.4,
              delay: reduced ? 0 : 0.05 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Slide 2 of the phone showcase: an animated analytics chart that draws itself
 * left-to-right, then comes alive (breathing endpoint, drifting figure, area
 * pour-up and a looping live-feed ring). Remounted whenever it (de)activates so
 * the draw replays on each visit; reduced-motion users get the finished chart.
 */
export const ShowcaseChart = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <ChartSlide active={active} reduced={reduced} />;
};
