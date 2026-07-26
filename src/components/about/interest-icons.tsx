/**
 * Detailed hobby glyphs for the About interests row. Custom SVGs (not emoji or
 * a generic puzzle icon) so they read clearly at small sizes and inherit the
 * surrounding text colour via `currentColor`.
 */

/** A recognisable chess-knight silhouette, with a cut-out eye for detail. */
export const KnightIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="M5.5 21.5h13a.6.6 0 0 0 .6-.6c0-.8-.6-1.4-1.4-1.4H17c.5-2.7.3-5-.6-6.9-.9-1.9-2.4-3.3-4.2-4.3l.9-1.7a.85.85 0 0 0-.35-1.15l-.9-.45-.65 1.3-2-1.05.45 2.15C7.9 8.7 6 11 5.4 13.7c-.25 1.05.65 2 1.7 1.75l1.3-.55.75 1.4 1.75-1.2c-2.2 1.9-3.55 4-3.65 6.35H6.3c-.8 0-1.4.6-1.4 1.4 0 .33.27.6.6.6Z" />
    <circle cx="10" cy="9" r=".85" className="fill-background" />
  </svg>
);

type Pt = [number, number];

const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/** The two inner lines (thirds) of a quad, in both directions → a 3×3 grid. */
const gridLines = ([a, b, c, d]: [Pt, Pt, Pt, Pt]): [Pt, Pt][] =>
  [1 / 3, 2 / 3].flatMap((t): [Pt, Pt][] => [
    [lerp(a, b, t), lerp(d, c, t)],
    [lerp(a, d, t), lerp(b, c, t)],
  ]);

// Isometric cube corners (top, and the three visible faces).
const T: Pt = [12, 3];
const R: Pt = [21, 8];
const Fr: Pt = [12, 13];
const L: Pt = [3, 8];
const Lb: Pt = [3, 16];
const Fb: Pt = [12, 21];
const Rb: Pt = [21, 16];

const FACES: [Pt, Pt, Pt, Pt][] = [
  [T, R, Fr, L], // top
  [L, Fr, Fb, Lb], // front-left
  [Fr, R, Rb, Fb], // front-right
];

/** An isometric Rubik's cube — three faces, each subdivided into a 3×3 grid. */
export const CubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinejoin="round"
    strokeLinecap="round"
    aria-hidden
    focusable="false"
    className={className}
  >
    <polygon
      points="12,3 21,8 21,16 12,21 3,16 3,8"
      fill="currentColor"
      fillOpacity={0.06}
    />
    {FACES.map((face, i) => (
      <polygon key={i} points={face.map((p) => p.join(",")).join(" ")} />
    ))}
    {FACES.flatMap(gridLines).map(([p, q], i) => (
      <line
        key={i}
        x1={p[0]}
        y1={p[1]}
        x2={q[0]}
        y2={q[1]}
        strokeOpacity={0.55}
      />
    ))}
  </svg>
);
