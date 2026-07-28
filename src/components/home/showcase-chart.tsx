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
 * Geometry. The chart is a single, pre-built curve that scrolls left at a
 * constant speed — the whole series (including the readings that haven't reached
 * the screen yet) exists off the right edge from the start, so new points simply
 * flow in from beyond the frame rather than being spliced on. The series repeats
 * every `K` points (`UNIQUE_Y[i % K]`), so the scroll can loop forever with no
 * seam: at the wrap the next viewport is byte-for-byte the one it started with.
 */
const SLOT = 42; // px between readings
const VB_W = 294; // = 7 * SLOT — 8 points span the viewport (indices 0..7)
const VB_H = 220;
const BOTTOM = 206;
const RIGHT_X = VB_W; // the pinned endpoint / newest-reading edge
const EDGE_INDEX = VB_W / SLOT; // 7 — the index sitting on the right edge at rest

/** One loop period of readings, plus the paired headline figures. Hand-picked
 *  (not random) so the server and client render identically — no hydration
 *  mismatch — and so the money/growth stay inside their ranges. */
const K = 20;
const UNIQUE_Y = [
  168, 146, 122, 140, 98, 118, 150, 74, 98, 60, 86, 46, 72, 112, 88, 134, 102,
  152, 126, 158,
];
/** Money ($k, 46–50) and growth (%, 142–150) per reading; index 7 (the one at
 *  rest on the right edge) matches the intro's count-up targets for a seamless
 *  hand-off. */
const VALUES = [
  47.1, 47.6, 46.8, 48.0, 47.4, 48.6, 47.9, 48.2, 49.1, 48.4, 49.6, 48.9, 47.8,
  49.3, 48.1, 46.9, 47.5, 48.8, 49.4, 47.2,
];
const GROWTHS = [
  144, 145, 143, 147, 144, 148, 145, 146, 149, 147, 150, 148, 143, 149, 146,
  142, 144, 147, 150, 145,
];
const INTRO_VALUE = VALUES[EDGE_INDEX];
const INTRO_GROWTH = GROWTHS[EDGE_INDEX];

/** Extra points rendered off each edge so the curve's smoothing has real
 *  neighbours everywhere — including at the loop wrap, so its shape never pops.
 *  The right pad keeps the viewport covered at maximum leftward shift. */
const PAD_L = 2;
const PAD_R = EDGE_INDEX + 2;

const GRID_Y = [30, 75, 120, 165, 210];
const DRAW_SECONDS = 1.6;
/** Seconds for one reading to travel a full slot — the constant scroll speed. */
const SLOT_SECONDS = 2.6;

const mod = (n: number, m: number) => ((n % m) + m) % m;

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

/** The full rolling series as SVG points, from a couple slots off the left to
 *  well past the right edge — computed once, static, at module load. */
const POINTS: [number, number][] = [];
for (let i = -PAD_L; i <= K + PAD_R; i++) {
  POINTS.push([i * SLOT, UNIQUE_Y[mod(i, K)]]);
}
const LINE_D = smoothPath(POINTS);
const AREA_D = `${LINE_D} L ${POINTS[POINTS.length - 1][0]},${BOTTOM} L ${POINTS[0][0]},${BOTTOM} Z`;

const VALUE_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

/** Sampled (x → y) lookup along the smooth line, so the endpoint dot can sit
 *  exactly on the curve at any x. `x` is monotonic, so lookups binary-search. */
type XYTable = { xs: number[]; ys: number[] };

const sampleY = (table: XYTable | null, x: number) => {
  if (!table || table.xs.length === 0) {
    // Pre-measure fallback: the curve passes through each data point, so the
    // nearest reading's y is a good stand-in until the table is built.
    return UNIQUE_Y[mod(Math.round(x / SLOT), K)];
  }
  const { xs, ys } = table;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const span = xs[hi] - xs[lo] || 1;
  const t = (x - xs[lo]) / span;
  return ys[lo] + (ys[hi] - ys[lo]) * t;
};

/**
 * The chart itself. Kept as an inner component so the parent can remount it
 * (via `key`) whenever the slide becomes active, replaying from scratch.
 *
 * Intro: a fixed clip grows left-to-right so the line *and* its gradient area
 * are revealed together in lockstep (no line drawn over a pre-filled area).
 * Live: the whole pre-built curve slides left under a fixed viewport clip at a
 * constant speed and loops seamlessly — readings flow in from beyond the right
 * edge, where a breathing dot stays pinned. Headline figures step per reading
 * via `NumberFlow`. Reduced-motion users get the finished chart at rest.
 */
const ChartSlide = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  // Intro reveal width; drives the clip, the count-up and the intro dot.
  const revealW = useMotionValue(reduced ? VB_W : 0);
  // Continuous leftward scroll offset once live.
  const shiftX = useMotionValue(0);
  const tableRef = useRef<XYTable | null>(null);
  const slotRef = useRef(-1);
  // Flips true once the intro reveal completes (or immediately under reduced
  // motion), switching the chart into its live rolling phase.
  const [done, setDone] = useState(reduced);
  // Stepped headline figures, rolled by NumberFlow once live.
  const [value, setValue] = useState(INTRO_VALUE);
  const [growth, setGrowth] = useState(INTRO_GROWTH);

  // Build the x→y lookup once from a detached path (no DOM attach needed).
  useEffect(() => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", LINE_D);
    const len = path.getTotalLength();
    if (!len) return;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let d = 0; d <= len; d += 3) {
      const pt = path.getPointAtLength(d);
      xs.push(pt.x);
      ys.push(pt.y);
    }
    tableRef.current = { xs, ys };
  }, []);

  // Intro: sweep the reveal clip across the viewport, then go live.
  useEffect(() => {
    if (reduced || !active) return;
    const controls = animate(revealW, VB_W, {
      duration: DRAW_SECONDS,
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [active, reduced, revealW]);

  // Live: one constant-speed linear scroll across a full period, looping. The
  // series is periodic, so the wrap is invisible — no per-cycle splice, no jerk.
  useEffect(() => {
    if (reduced || !done || !active) return;
    const controls = animate(shiftX, -SLOT * K, {
      duration: SLOT_SECONDS * K,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => {
      controls.stop();
      shiftX.jump(0);
    };
  }, [active, done, reduced, shiftX]);

  // Step the headline figures as each new reading crosses the right edge.
  useMotionValueEvent(shiftX, "change", (tx) => {
    const slot = Math.floor(-tx / SLOT);
    if (slot === slotRef.current) return;
    slotRef.current = slot;
    const i = mod(EDGE_INDEX + slot, K);
    setValue(VALUES[i]);
    setGrowth(GROWTHS[i]);
  });

  // Intro count-up, driven by the sweep so it lands exactly as the reveal fills.
  const valueText = useTransform(revealW, (w) =>
    ((w / VB_W) * INTRO_VALUE).toFixed(1),
  );
  const growthText = useTransform(revealW, (w) =>
    Math.round((w / VB_W) * INTRO_GROWTH),
  );
  // Endpoint dot: rides the reveal edge during the intro, then pins to the right
  // edge and tracks the curve as it scrolls under it.
  const introDotY = useTransform(revealW, (w) => sampleY(tableRef.current, w));
  const liveDotY = useTransform(shiftX, (tx) =>
    sampleY(tableRef.current, RIGHT_X - tx),
  );
  const dotOpacity = useTransform(revealW, [0, 10], [0, 1]);
  const live = done && !reduced;

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
          {/* Fixed viewport clip. During the intro its width grows 0 → VB_W, so
              the line and its gradient reveal together; once live it stays full
              width, hiding the readings that haven't scrolled in yet. */}
          <clipPath id="chart-reveal">
            <motion.rect x={0} y={0} height={VB_H} style={{ width: revealW }} />
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

        {/* Line + area scroll together inside the fixed viewport clip. */}
        <g clipPath="url(#chart-reveal)">
          <motion.g style={{ x: shiftX }}>
            <path d={AREA_D} fill="url(#chart-area)" />
            <path
              d={LINE_D}
              fill="none"
              stroke="#34d399"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#chart-glow)"
            />
          </motion.g>
        </g>

        {/* Endpoint dot — outside the clip so it stays crisp on the edge. */}
        <motion.g
          style={{
            x: done ? RIGHT_X : revealW,
            y: done ? liveDotY : introDotY,
            opacity: reduced ? 1 : dotOpacity,
          }}
        >
          {live && (
            <motion.circle
              r={5}
              fill="#34d399"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              animate={{ scale: [1, 3], opacity: [0.45, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
            />
          )}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={!reduced ? { scale: [1, 1.18, 1] } : undefined}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <circle r={3.5} fill="#ecfdf5" />
            <circle r={3.5} fill="#34d399" opacity={0.5} />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
};

/**
 * Slide 2 of the phone showcase: an analytics chart that reveals itself (line
 * and gradient together), then scrolls continuously — pre-built readings flow
 * in from beyond the right edge past a pinned, breathing endpoint while the
 * headline figures step over. Remounted whenever it (de)activates so the intro
 * replays; reduced-motion users get the finished chart at rest.
 */
export const ShowcaseChart = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <ChartSlide active={active} reduced={reduced} />;
};
