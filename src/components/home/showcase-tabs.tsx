import {
  Box,
  CreditCard,
  LayoutList,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/i18n/strings";

import { cn } from "@/lib/utils";

/**
 * One tab per showcase slide, in carousel order: the 3D cube, the analytics
 * chart, the Face ID unlock, and the product list.
 */
export const showcaseTabs: { key: string; Icon: LucideIcon }[] = [
  { key: "cube", Icon: Box },
  { key: "chart", Icon: LineChart },
  { key: "faceid", Icon: CreditCard },
  { key: "list", Icon: LayoutList },
];

/**
 * A native-app-style bottom tab bar that floats inside the phone screen, giving
 * the showcase the same liquid-glass language as the site's real tab bar. The
 * glass is self-contained (a frosted translucent pill on the always-dark app
 * screen), so it stays correct regardless of the page theme.
 *
 * Live tabs (`i < liveCount`) are real buttons that jump to their slide; tabs
 * for not-yet-built slides render as dimmed, decorative previews.
 */
export const ShowcaseTabs = ({
  index,
  liveCount = showcaseTabs.length,
  onSelect,
  className,
}: {
  index: number;
  liveCount?: number;
  onSelect?: (i: number) => void;
  className?: string;
}) => {
  const base =
    "flex size-7 items-center justify-center rounded-full transition-colors";

  return (
    <div
      role="tablist"
      aria-label={t("Home.showcase.label")}
      className={cn(
        "flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_16px_-8px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {showcaseTabs.map(({ key, Icon }, i) =>
        i < liveCount ? (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t(`Home.showcase.tabs.${key}`)}
            onClick={() => onSelect?.(i)}
            className={cn(
              base,
              "cursor-pointer",
              i === index
                ? "bg-white/20 text-white"
                : "text-white/45 hover:text-white/70",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        ) : (
          <span key={key} aria-hidden className={cn(base, "text-white/20")}>
            <Icon className="size-3.5" />
          </span>
        ),
      )}
    </div>
  );
};
