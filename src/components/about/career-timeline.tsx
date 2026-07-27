import { GraduationCap } from "lucide-react";
import { motion } from "motion/react";

import { milestones, type Milestone } from "@/config/career";
import { useMounted } from "@/hooks/use-mounted";
import { t } from "@/i18n/strings";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A single node on the timeline: a marker column (dot + connecting line) beside
 * the role's period, title, company and blurb. Education nodes swap the plain
 * dot for a graduation cap and cap off the rail (no trailing line).
 */
const TimelineNode = ({
  milestone,
  isLast,
  index,
  animate,
}: {
  milestone: Milestone;
  isLast: boolean;
  index: number;
  /** Only animate after mount so the SSR/first paint stays fully visible. */
  animate: boolean;
}) => {
  const { id, company, period, type, kind } = milestone;
  const isEducation = kind === "education";

  return (
    <motion.li
      className="flex gap-4"
      initial={animate ? { opacity: 0, y: 16 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: easeOutExpo, delay: index * 0.06 }}
    >
      {/* Marker column: the dot, plus a line that grows to the next node. */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full",
            isEducation
              ? "border-accent/40 text-accent bg-background size-8 border"
              : "bg-accent ring-accent/20 mt-1.5 size-3 ring-4",
          )}
        >
          {isEducation && <GraduationCap className="size-4" aria-hidden />}
        </span>
        {!isLast && <span className="bg-border mt-1 w-px flex-1" />}
      </div>

      {/* Content. */}
      <div className={cn("min-w-0", isLast ? "pb-1" : "pb-9")}>
        <p className="text-muted text-xs font-medium tracking-widest uppercase tabular-nums">
          {period}
        </p>
        <h3 className="mt-1.5 font-semibold tracking-tight">
          {t(`About.timeline.${id}.role`)}
        </h3>
        <p className="text-accent mt-0.5 text-sm font-medium">
          {company}
          {type && <span className="text-muted font-normal"> · {type}</span>}
        </p>
        <p className="text-muted mt-2 text-sm text-pretty">
          {t(`About.timeline.${id}.blurb`)}
        </p>
      </div>
    </motion.li>
  );
};

/**
 * The About tab's career timeline: a single left rail with a node per career
 * milestone, newest first, walking back in time and capping off at graduation.
 * Data-driven from `config/career.ts`; prose lives in the string base. Nodes
 * fade up as they scroll into view (only after mount, so SSR content is visible
 * with no opacity-0 flash — the same principle as `Reveal`).
 */
export const CareerTimeline = () => {
  const mounted = useMounted();

  return (
    <div className="mt-12">
      <h2 className="text-muted mb-6 text-xs font-medium tracking-widest uppercase">
        {t("About.timeline.label")}
      </h2>
      <ol>
        {milestones.map((milestone, i) => (
          <TimelineNode
            key={milestone.id}
            milestone={milestone}
            isLast={i === milestones.length - 1}
            index={i}
            animate={mounted}
          />
        ))}
      </ol>
    </div>
  );
};
