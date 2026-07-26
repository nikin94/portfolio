import { cn } from "@/lib/utils";

/**
 * A stylised iPhone frame, built as three nested layers so the screen edge
 * reads clearly even on a dark page:
 *   1. a light-catching metallic bezel (grey gradient + bright rim),
 *   2. a thin black surround (the phone's screen border),
 *   3. the screen itself — a subtly tinted dark surface with a bright inset
 *      ring and a top glass sheen, so it's obvious where the display begins.
 * A soft accent halo lifts the whole device off a dark background.
 *
 * Pure CSS chrome — decorative, hidden from assistive tech; the screen content
 * carries the labels. `children` fill the portrait screen (`aspect-[9/19.5]`,
 * clipped to the rounded corners).
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

    {/* 1. Metallic bezel: a grey light-catching gradient with a bright rim. It
        stays clearly metal (never fades to black) so it contrasts the screen. */}
    <div className="relative rounded-[2.6rem] bg-gradient-to-b from-neutral-400 via-neutral-600 to-neutral-800 p-1 shadow-2xl ring-1 ring-white/30">
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

      {/* 2. Black surround: the phone's screen border between metal and glass. */}
      <div className="rounded-[2.3rem] bg-black p-1.5">
        {/* 3. Screen: a dim tinted surface (kept dark so content reads as lit
            from within, not sitting on a bright panel) with a faint inset edge. */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.95rem] bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          {children}

          {/* Glass overlay ABOVE the content: a subtle edge vignette plus a
              faint diagonal sheen, so the content reads as sitting *under* the
              display glass rather than floating on top of it. Kept low-opacity
              and pointer-events-none so the cube stays visible and draggable. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[1.95rem] shadow-[inset_0_0_36px_10px_rgba(0,0,0,0.55)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/8 via-transparent to-transparent"
          />
          {/* Dynamic Island — sits above the glass overlay. */}
          <span
            aria-hidden
            className="absolute top-2.5 left-1/2 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10"
          />
        </div>
      </div>
    </div>
  </div>
);
