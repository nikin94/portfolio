import { cn } from "@/lib/utils";

/**
 * A stylised iPhone frame: a light-catching metallic bezel, rounded corners, a
 * Dynamic Island pill and hint side buttons, lifted off the page by a soft
 * accent halo so the dark device stays legible on a dark background. Pure CSS
 * chrome — decorative, so it's hidden from assistive tech; the screen content
 * carries the labels.
 *
 * `children` fill the portrait screen area (`aspect-[9/19.5]`, clipped to the
 * rounded corners) on a dark "app" background.
 */
export const PhoneFrame = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative", className)}>
    {/* Ambient accent halo — separates the dark device from a dark page. */}
    <div
      aria-hidden
      className="bg-accent/30 absolute -inset-5 -z-10 rounded-[3rem] blur-3xl"
    />

    {/* Bezel: a vertical metallic gradient with a bright rim highlight, so the
        edge catches light instead of blending into the background. */}
    <div className="relative rounded-[2.6rem] bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-950 p-2.5 shadow-2xl ring-1 ring-white/25">
      {/* Side buttons — decorative. */}
      <span
        aria-hidden
        className="absolute top-24 -left-0.5 h-8 w-0.5 rounded-l bg-neutral-500"
      />
      <span
        aria-hidden
        className="absolute top-36 -left-0.5 h-12 w-0.5 rounded-l bg-neutral-500"
      />
      <span
        aria-hidden
        className="absolute top-32 -right-0.5 h-16 w-0.5 rounded-r bg-neutral-500"
      />

      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.05rem] bg-neutral-950 ring-1 ring-white/10">
        {/* Dynamic Island. */}
        <span
          aria-hidden
          className="absolute top-2.5 left-1/2 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black"
        />
        {children}
      </div>
    </div>
  </div>
);
