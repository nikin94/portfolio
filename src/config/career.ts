/**
 * Career timeline — the single source of truth for the About tab's vertical
 * timeline. Language-neutral facts (company, period, work type, kind) live here;
 * the role title and blurb are string-base keys under `About.timeline.<id>`, so
 * prose stays in the one message base.
 *
 * Ordered newest first, walking back in time to graduation — the timeline
 * renders in this order and caps off at the education node.
 */
export type MilestoneKind = "role" | "education";

export interface Milestone {
  /** Stable id; also the string key prefix under `About.timeline.<id>`. */
  id: string;
  /** Company / institution name (not translated). */
  company: string;
  /** Human-readable span shown on the node, e.g. "2025 — 2026". */
  period: string;
  /** Work arrangement (roles only), e.g. "Hybrid", "Remote", "On-site". */
  type?: string;
  /** `role` renders a briefcase dot; `education` caps the timeline. */
  kind: MilestoneKind;
}

export const milestones: Milestone[] = [
  {
    id: "pyra",
    company: "Pyra",
    period: "2025 — 2026",
    type: "Hybrid",
    kind: "role",
  },
  {
    id: "applica",
    company: "Applica Agency",
    period: "2024 — 2025",
    type: "Remote",
    kind: "role",
  },
  {
    id: "freelance",
    company: "Freelance",
    period: "2023 — 2024",
    type: "Remote",
    kind: "role",
  },
  {
    id: "cloudfactory",
    company: "CloudFactory",
    period: "2021 — 2022",
    type: "Remote",
    kind: "role",
  },
  {
    id: "decision-mapper",
    company: "Decision Mapper",
    period: "2019 — 2020",
    type: "On-site",
    kind: "role",
  },
  {
    id: "kport",
    company: "Kport Web Studio",
    period: "2017 — 2018",
    type: "On-site",
    kind: "role",
  },
  {
    id: "graduation",
    company: "Vernadsky Taurida National University",
    period: "Graduated",
    kind: "education",
  },
];
