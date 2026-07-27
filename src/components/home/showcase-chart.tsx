import NumberFlow from "@number-flow/react";
import { TrendingUp } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * The chart is a rolling conveyor of points. `xAt` maps a series index to an
 * x in SVG space: index 0 sits one slot off the left (a buffer that scrolls
 * out), the last index sits at/just past the right edge as the incoming point.
 */
const SLOT = 42;
/** Points held in the series: 1 off-left buffer + visible span + 1 incoming. */
const N = 9;
const VB_W = 300;
const VB_H = 220;
const BOTTOM = 206;
/** y band (SVG space — smaller y is higher on screen). */
const Y_HI = 22;
const Y_LO = 188;

const xAt = (i: number) => (i - 1) * SLOT; // -42, 0, 42 … 294
/** The point the breathing endpoint rides — the newest fully on-screen reading. */
const END = N - 2;

/** A gently rising starter shape so the first draw already reads as real data. */
const INITIAL_Y = [196, 172, 150, 118, 130, 92, 70, 44, 24];

const GRID_Y = [30, 75, 120, 165, 210];
const DRAW_SECONDS = 1.7;
/** How often a new reading rolls in, and how long the leftward slide takes. */
const ROLL_EVERY_MS = 2200;
const ROLL_SECONDS = 1.1;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Next reading: a bounded random walk, so the line stays lively and in view. */
const nextY = (prev: number) =>
  clamp(prev + (Math.random() - 0.5) * 80, Y_HI, Y_LO);

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

const VALUE_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

/**
 * The chart draw itself. Kept as an inner component so the parent can remount it
 * (via `key`) whenever the slide becomes active — that replays from scratch
 * without resetting state inside an effect.
 *
 * The line first draws itself left-to-right (a single `progress` MotionValue
 * drives it and the counting headline). Once it reaches the top it starts
 * rolling: every couple of seconds the whole line slides one slot left as a new
 * reading arrives at the right, continuing the drawing — a live feed. The
 * headline figures roll with each new reading via `NumberFlow`, and the endpoint
 * keeps breathing. Reduced-motion users get the finished chart at rest.
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
  // Leftward conveyor offset, reset to 0 the instant a new reading commits.
  const shiftX = useMotionValue(0);
  const lineRef = useRef<SVGPathElement>(null);
  const leadRef = useRef<SVGGElement>(null);
  const lineLength = useRef<number | null>(null);
  // Flips true once the intro draw completes (or immediately under reduced
  // motion), switching the chart from "drawing" into its live rolling phase.
  const [done, setDone] = useState(reduced);
  // Headline figures once live — animated by NumberFlow on every change. They
  // begin at the drawn total; each roll bumps them.
  const [value, setValue] = useState(48.2);
  const [growth, setGrowth] = useState(146);

  // Draw once the slide is active and mark done when the line reaches the top.
  // The parent remounts this slide on entry, so state already starts fresh —
  // no reset needed here.
  useEffect(() => {
    if (reduced || !active) return;
    const controls = animate(progress, 1, {
      duration: DRAW_SECONDS,
      ease: "linear",
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [active, reduced, progress]);

  // Roll a new reading in on a loop once live: slide left one slot, then commit
  // the shifted series (drop the oldest, append a fresh reading) and snap the
  // offset back to 0 in the same render — seamless, no jump.
  useEffect(() => {
    if (reduced || !done || !active) return;
    let slide: AnimationPlaybackControls | null = null;
    const id = window.setInterval(() => {
      slide = animate(shiftX, -SLOT, {
        duration: ROLL_SECONDS,
        ease: "easeInOut",
        onComplete: () => {
          shiftX.jump(0);
          setSeries((s) => [...s.slice(1), nextY(s[s.length - 1])]);
          setValue(
            (v) => Math.round((v + 0.2 + Math.random() * 1.1) * 10) / 10,
          );
          setGrowth((g) =>
            clamp(g + Math.round(Math.random() * 6 - 2), 120, 180),
          );
        },
      });
    }, ROLL_EVERY_MS);
    return () => {
      window.clearInterval(id);
      slide?.stop();
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

  const areaOpacity = useTransform(progress, [0, 0.05, 1], [0, 1, 1]);
  // Headline counts up alongside the intro draw; NumberFlow takes over once live.
  const valueText = useTransform(progress, (p) => (p * 48.2).toFixed(1));
  const growthText = useTransform(progress, (p) => Math.round(p * 146));
  const live = done && !reduced;
  const introLead = !reduced && !done;

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
          {/* Clip the rolling conveyor to the chart viewport so points scrolling
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

        {/* The conveyor: area, line and endpoint slide left together. */}
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

            {/* Endpoint once live/at rest: rides the newest reading, breathing,
                with a "new reading" ring radiating out on a loop. */}
            {(live || reduced) && (
              <g transform={`translate(${xAt(END)} ${series[END]})`}>
                {live && (
                  <motion.circle
                    r={5}
                    fill="#34d399"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                    animate={{ scale: [1, 3], opacity: [0.45, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.4,
                      ease: "easeOut",
                    }}
                  />
                )}
                <motion.g
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                  animate={live ? { scale: [1, 1.18, 1] } : {}}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <circle r={3.5} fill="#ecfdf5" />
                  <circle r={3.5} fill="#34d399" opacity={0.5} />
                </motion.g>
              </g>
            )}
          </motion.g>
        </g>

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
 * left-to-right, then rolls live — new readings slide in from the right as the
 * headline figures roll over, the endpoint breathing. Remounted whenever it
 * (de)activates so the draw replays on each visit; reduced-motion users get the
 * finished chart at rest.
 */
export const ShowcaseChart = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <ChartSlide active={active} reduced={reduced} />;
};
