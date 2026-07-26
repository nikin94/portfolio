import type { Platform } from "@/config/projects";
import { cn } from "@/lib/utils";

/**
 * Lightweight CSS chrome that frames a project screenshot as either a phone
 * (portrait, notch hint) or a browser window (traffic-light dots), so the
 * mobile-vs-web split reads at a glance. Pure presentation — decorative, so
 * it's hidden from assistive tech; the card carries the real label.
 */
export const DeviceFrame = ({
  platform,
  children,
  className,
}: {
  platform: Platform;
  children?: React.ReactNode;
  className?: string;
}) =>
  platform === "mobile" ? (
    <div
      aria-hidden
      className={cn(
        "border-border bg-background relative aspect-[9/19.5] h-full rounded-[1.5rem] border-[3px] p-1 shadow-sm",
        className,
      )}
    >
      <span className="bg-border absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full" />
      <div className="bg-muted/10 h-full w-full overflow-hidden rounded-[1.1rem]">
        {children}
      </div>
    </div>
  ) : (
    <div
      aria-hidden
      className={cn(
        "border-border bg-background relative aspect-[16/10] w-full overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <div className="border-border bg-muted/10 flex h-6 items-center gap-1.5 border-b px-3">
        <span className="bg-border size-2 rounded-full" />
        <span className="bg-border size-2 rounded-full" />
        <span className="bg-border size-2 rounded-full" />
      </div>
      <div className="bg-muted/5 h-[calc(100%-1.5rem)] w-full">{children}</div>
    </div>
  );
