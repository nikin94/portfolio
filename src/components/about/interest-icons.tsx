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
const maskStyle = (url: string) => ({
  maskImage: `url(${url})`,
  WebkitMaskImage: `url(${url})`,
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskSize: "contain",
  WebkitMaskSize: "contain",
});

const MaskIcon = ({ url, className }: { url: string; className?: string }) => (
  <span
    aria-hidden
    className={cn("inline-block bg-current", className)}
    style={maskStyle(url)}
  />
);

export const KnightIcon = ({ className }: { className?: string }) => (
  <MaskIcon url={knightUrl} className={className} />
);

export const RacketIcon = ({ className }: { className?: string }) => (
  <MaskIcon url={racketUrl} className={className} />
);

export const CubeIcon = ({ className }: { className?: string }) => (
  <img
    src={cubeUrl}
    alt=""
    aria-hidden
    className={cn("object-contain", className)}
  />
);
