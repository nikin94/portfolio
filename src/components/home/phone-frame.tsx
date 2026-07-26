import { cn } from "@/lib/utils";

/**
 * A stylised iPhone frame: dark bezel, rounded corners, a Dynamic Island pill
 * and hint side buttons. Pure CSS chrome — the buttons/island are decorative,
 * so they're hidden from assistive tech; the screen content carries the labels.
 *
 * `children` fill the portrait screen area (`aspect-[9/19.5]`, clipped to the
 * rounded corners), sitting on a dark "app" background.
 */
export const PhoneFrame = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "relative rounded-[2.6rem] bg-neutral-900 p-2.5 shadow-2xl ring-1 ring-black/20",
      className,
    )}
  >
    {/* Side buttons — decorative. */}
    <span
      aria-hidden
      className="absolute top-24 -left-0.5 h-8 w-0.5 rounded-l bg-neutral-700"
    />
    <span
      aria-hidden
      className="absolute top-36 -left-0.5 h-12 w-0.5 rounded-l bg-neutral-700"
    />
    <span
      aria-hidden
      className="absolute top-32 -right-0.5 h-16 w-0.5 rounded-r bg-neutral-700"
    />

    <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.05rem] bg-neutral-950">
      {/* Dynamic Island. */}
      <span
        aria-hidden
        className="absolute top-2.5 left-1/2 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black"
      />
      {children}
    </div>
  </div>
);
