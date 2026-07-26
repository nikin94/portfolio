import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * In-app navigation affordance for the phone showcase: prev/next chevrons
 * flanking a row of page dots, styled like native iOS page controls. It signals
 * that the screen is a swipeable, multi-slide carousel of feature demos rather
 * than a single static image.
 *
 * For now it's a static preview (only the cube slide is live), so the whole
 * control is decorative — the auto-advancing, swipeable carousel wires the
 * chevrons and dots up in a follow-up.
 */
export const ShowcaseControls = ({
  count,
  index,
  className,
}: {
  count: number;
  index: number;
  className?: string;
}) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none flex items-center justify-center gap-2.5",
      className,
    )}
  >
    <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white/60">
      <ChevronLeft className="size-3.5" />
    </span>

    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === index ? "w-4 bg-white" : "w-1.5 bg-white/35",
          )}
        />
      ))}
    </div>

    <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white/60">
      <ChevronRight className="size-3.5" />
    </span>
  </div>
);
