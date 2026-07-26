/**
 * Static stand-in for the interactive cube: a single 3×3 face. Shown on the
 * server, during the first paint, while the WebGL chunk loads, and as the
 * permanent view for reduced-motion / low-power devices. Zero JS cost.
 */

// Precomputed so no style objects are allocated on render.
const CELLS = [
  "#c41e3a",
  "#ffffff",
  "#009b48",
  "#ffd500",
  "#c41e3a",
  "#0046ad",
  "#ff5800",
  "#009b48",
  "#ffd500",
].map((backgroundColor) => ({ backgroundColor }));

export const CubeFallback = () => (
  <div className="grid size-full place-items-center">
    <div className="grid grid-cols-3 gap-2 rounded-3xl bg-neutral-950 p-3 shadow-xl ring-1 ring-white/10">
      {CELLS.map((style, i) => (
        <span
          // Fixed 3×3 grid; cells never reorder.
          key={i}
          style={style}
          className="size-12 rounded-lg sm:size-14"
        />
      ))}
    </div>
  </div>
);
