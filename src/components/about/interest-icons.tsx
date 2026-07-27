import racketUrl from "@/assets/badminton-racket.svg";
import cubeUrl from "@/assets/rubiks-cube.svg";
import knightUrl from "@/assets/knight.svg";
import { cn } from "@/lib/utils";

/**
 * Hobby glyphs for the About interests row, imported as static SVG assets.
 *
 * The knight and racket are single-colour silhouettes, so they're painted via a
 * CSS mask filled with `currentColor` (`bg-current`) instead of an `<img>`. That
 * makes them theme-adaptive — the chip sets `currentColor` to the foreground, so
 * they render dark on the light theme and light on the dark theme, whatever the
 * source file's own fill colour is. The Rubik's cube keeps its real colours, so
 * it stays a plain `<img>`.
 */
/**
 * Mask style for a given SVG url. The urls are module constants, so each icon's
 * style object is built once at module load rather than re-allocated on every
 * render.
 */
const maskStyle = (url: string) =>
  ({
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
  }) as const;

const KNIGHT_MASK = maskStyle(knightUrl);
const RACKET_MASK = maskStyle(racketUrl);

const MaskIcon = ({
  style,
  className,
}: {
  style: React.CSSProperties;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn("inline-block bg-current", className)}
    style={style}
  />
);

export const KnightIcon = ({ className }: { className?: string }) => (
  <MaskIcon style={KNIGHT_MASK} className={className} />
);

export const RacketIcon = ({ className }: { className?: string }) => (
  <MaskIcon style={RACKET_MASK} className={className} />
);

export const CubeIcon = ({ className }: { className?: string }) => (
  <img
    src={cubeUrl}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);
