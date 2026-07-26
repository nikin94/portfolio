import racketUrl from "@/assets/badminton-racket.svg";
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
 * A badminton racket, imported as a static SVG asset (provided artwork) and
 * rendered as an image — used on the About badminton chip instead of the
 * shuttlecock (the flying shuttle in the rally is unchanged).
 */
export const RacketIcon = ({ className }: { className?: string }) => (
  <img
    src={racketUrl}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);
