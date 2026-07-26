import { motion } from "motion/react";
import { t } from "@/i18n/strings";

import { projectFilters, type ProjectFilter } from "@/config/projects";
import { cn } from "@/lib/utils";

/**
 * iOS-style segmented control for the Work grid. A shared `layoutId` pill
 * slides under the active segment (native feel). Controlled by the parent so
 * the grid and the control stay in sync.
 */
export const ProjectFilterControl = ({
  value,
  onChange,
}: {
  value: ProjectFilter;
  onChange: (filter: ProjectFilter) => void;
}) => {
  return (
    <div
      role="tablist"
      aria-label={t("Work.filterLabel")}
      className="border-border bg-foreground/5 inline-flex items-center gap-1 rounded-full border p-1"
    >
      {projectFilters.map((filter) => {
        const isActive = filter === value;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="work-filter-active"
                className="bg-background absolute inset-0 rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{t(`Work.filters.${filter}`)}</span>
          </button>
        );
      })}
    </div>
  );
};
