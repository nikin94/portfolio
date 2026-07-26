import { TrendingUp } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Data points for a generally-rising series (y is SVG-space, so smaller = up).
 * Kept slightly wiggly so the uptrend reads as real data, not a straight ramp.
 */
const POINTS: [number, number][] = [
  [10, 140],
  [50, 116],
  [90, 124],
  [130, 90],
  [170, 96],
  [210, 58],
  [250, 50],
  [290, 16],
];
const BOTTOM = 150;
const FIRST_X = POINTS[0][0];
const LAST_X = POINTS[POINTS.length - 1][0];
const SPAN = LAST_X - FIRST_X;

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
const GRID_Y = [30, 70, 110, 150];
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
 * Slide 2 of the phone showcase: an animated analytics chart. The line draws
 * left-to-right (stroke `pathLength`), a gradient area reveals under it in sync
 * (a growing clip), each data point pops in as the sweep passes, a glowing dot
 * rides the leading edge, and the headline value + growth badge count up — all
 * driven by a single `progress` MotionValue so everything stays in lockstep.
 *
 * Re-plays every time the slide becomes active; reduced-motion users get the
 * finished chart with no drawing. Decorative, so it's hidden from assistive
 * tech — the tab bar carries the label.
 */
export const ShowcaseChart = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  const progress = useMotionValue(0);
  const lineRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGGElement>(null);

  // One value drives the whole reveal. Reduced motion jumps straight to the
  // finished chart; leaving the slide resets so it re-draws on the next visit.
  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    if (!active) {
      progress.set(0);
      return;
    }
    const controls = animate(progress, 1, {
      duration: DRAW_SECONDS,
      ease: "linear",
    });
    return () => controls.stop();
  }, [active, reduced, progress]);

  // Move the glowing leading dot to the exact tip of the drawn line.
  useMotionValueEvent(progress, "change", (p) => {
    const path = lineRef.current;
    const lead = leadRef.current;
    if (!path || !lead || typeof path.getTotalLength !== "function") return;
    const pt = path.getPointAtLength(p * path.getTotalLength());
    lead.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    lead.style.opacity = p > 0.01 && p < 0.999 ? "1" : "0";
  });

  const clipWidth = useTransform(progress, (p) => p * 300);
  const value = useTransform(progress, (p) => (p * 48.2).toFixed(1));
  const growth = useTransform(progress, (p) => Math.round(p * 142));

  return (
    <div aria-hidden className="flex h-full flex-col justify-center gap-4">
      <div className="px-1">
        <p className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
          Revenue
        </p>
        <p className="mt-0.5 text-2xl font-semibold text-white tabular-nums">
          $<motion.span>{value}</motion.span>k
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-400 tabular-nums">
          <TrendingUp className="size-3.5" />+
          <motion.span>{growth}</motion.span>%
          <span className="ml-1 text-white/35">last 8 weeks</span>
        </p>
      </div>

      <svg viewBox="0 0 300 160" className="w-full overflow-visible">
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          <clipPath id="chart-reveal">
            <motion.rect
              x={0}
              y={0}
              height={160}
              style={{ width: clipWidth }}
            />
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
            strokeWidth={1}
          />
        ))}

        {/* Area + line revealed left-to-right by the growing clip. */}
        <g clipPath="url(#chart-reveal)">
          <path d={AREA_D} fill="url(#chart-area)" />
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
        </g>

        {/* Data points pop in as the sweep passes each one. */}
        {POINTS.map((p) => (
          <DataDot key={p[0]} point={p} progress={progress} />
        ))}

        {/* Glowing dot on the leading edge, with a pulsing halo. */}
        <g ref={leadRef} style={{ opacity: 0 }}>
          <motion.circle
            r={5}
            fill="#34d399"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={
              active && !reduced ? { scale: [1, 2.6], opacity: [0.4, 0] } : {}
            }
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
          <circle r={3.5} fill="#ecfdf5" />
          <circle r={3.5} fill="#34d399" opacity={0.5} />
        </g>
      </svg>
    </div>
  );
};
