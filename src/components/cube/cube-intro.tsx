import { motion } from "motion/react";

/**
 * Loading intro for the WebGL cube: an isometric "blueprint" wireframe of the
 * Rubik's cube that draws itself stroke-by-stroke — and un-draws in reverse — on
 * a loop while the three.js chunk downloads. It turns the unavoidable load delay
 * into a deliberate micro-scene (a cube being sketched into existence) rather
 * than an empty box or a flashing placeholder, and it reads unmistakably as a
 * cube at a glance, on mobile included. Once the live cube paints, the parent
 * cross-fades this out and the real cube scales into its place.
 *
 * `animate` drives the looping draw: `false` renders the finished wireframe at
 * rest, with no motion — the server / no-JS view, and any pre-hydration paint.
 * Decorative, so it's hidden from assistive tech (the hero wrapper carries the
 * real label).
 */

/** Build one face's 3×3 grid as SVG line sub-paths from an origin + two edges. */
const facePath = (
  o: [number, number],
  u: [number, number],
  v: [number, number],
  n = 3,
) => {
  const at = (a: number, b: number) =>
    `${(o[0] + u[0] * a + v[0] * b).toFixed(2)} ${(
      o[1] +
      u[1] * a +
      v[1] * b
    ).toFixed(2)}`;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    d += `M${at(f, 0)}L${at(f, 1)}`; // line spanning v
    d += `M${at(0, f)}L${at(1, f)}`; // line spanning u
  }
  return d;
};

// Isometric cube, three visible faces, centred in the 100×100 box. Front square
// plus a top and right parallelogram sheared back along (15,-15).
const CUBE_PATH =
  facePath([22.5, 37.5], [40, 0], [0, 40]) + // front
  facePath([22.5, 37.5], [40, 0], [15, -15]) + // top
  facePath([62.5, 37.5], [15, -15], [0, 40]); // right

export const CubeIntro = ({ animate }: { animate: boolean }) => (
  <svg
    aria-hidden
    viewBox="0 0 100 100"
    className="text-accent size-full overflow-visible"
    style={{
      filter:
        "drop-shadow(0 0 3px color-mix(in oklab, currentColor 55%, transparent))",
    }}
  >
    <motion.path
      d={CUBE_PATH}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: animate ? 0 : 1 }}
      animate={{ pathLength: 1 }}
      transition={
        animate
          ? {
              duration: 1.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.5,
            }
          : { duration: 0 }
      }
    />
  </svg>
);
