import { Bell, Box, LineChart, ScanFace, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One tab per showcase slide. Order matches the carousel: the cube is live; the
 * animated chart, Face ID unlock and push/skeleton demos land with the carousel.
 */
export const showcaseTabs: { key: string; Icon: LucideIcon }[] = [
  { key: "cube", Icon: Box },
  { key: "chart", Icon: LineChart },
  { key: "faceid", Icon: ScanFace },
  { key: "push", Icon: Bell },
];

/**
 * A native-app-style bottom tab bar that floats inside the phone screen, giving
 * the showcase the same liquid-glass language as the site's real tab bar. The
 * glass is self-contained (a frosted translucent pill on the always-dark app
 * screen), so it stays correct regardless of the page theme.
 *
 * For now it's a static preview (only the cube slide is live), so the whole
 * control is decorative — the auto-advancing, swipeable carousel wires the tabs
 * up in a follow-up.
 */
export const ShowcaseTabs = ({
  index,
  className,
}: {
  index: number;
  className?: string;
}) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-lg backdrop-blur-md",
      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_16px_-8px_rgba(0,0,0,0.6)]",
      className,
    )}
  >
    {showcaseTabs.map(({ key, Icon }, i) => (
      <span
        key={key}
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-colors",
          i === index ? "bg-white/20 text-white" : "text-white/45",
        )}
      >
        <Icon className="size-3.5" />
      </span>
    ))}
  </div>
);
