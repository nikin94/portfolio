import cubeUrl from "@/assets/rubiks-cube.svg";
import knightUrl from "@/assets/knight.svg";
import { cn } from "@/lib/utils";

/**
 * Hobby glyphs for the About interests row. The real illustrated artwork
 * (a Rubik's cube and a chess knight, public-domain from Openclipart) imported
 * as static SVG assets and rendered as images, rather than hand-rolled inline
 * paths. `object-contain` preserves each drawing's aspect ratio inside the
 * square box the caller sizes with a `size-*` class.
 */
export const KnightIcon = ({ className }: { className?: string }) => (
  <img
    src={knightUrl}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);

export const CubeIcon = ({ className }: { className?: string }) => (
  <img
    src={cubeUrl}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);

/**
 * A badminton racket (Stash icons, `racket-solid`). Monochrome and filled with
 * `currentColor`, so it reads crisply at chip size and matches the label
 * colour — used on the About badminton chip instead of the shuttlecock.
 */
export const RacketIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="M6.833 17.946a5 5 0 0 1-.49-.328a8 8 0 0 1-.978-.835a8.074 8.074 0 1 1 12.253-10.44c.122.167.232.319.328.49a8.09 8.09 0 0 1-.02 8.514l2.54 2.54a1.823 1.823 0 0 1-2.578 2.579l-2.54-2.54a8.09 8.09 0 0 1-8.515.02m10.236-7.343l-6.466 6.466c-.16.162-.311.312-.464.449a6.52 6.52 0 0 0 4.067-.734l-.002-.001a1.83 1.83 0 0 1 0-2.578a1.823 1.823 0 0 1 2.579 0h.001a6.52 6.52 0 0 0 .734-4.066c-.137.153-.288.303-.449.464m-1.836 4.89a.26.26 0 0 0 .076.185l3.684 3.683a.26.26 0 1 0 .368-.368l-2.995-2.995l-.004-.004l-.684-.684a.26.26 0 0 0-.445.184" />
  </svg>
);
