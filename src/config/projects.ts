/**
 * Portfolio projects — the single source of truth for the Work tab.
 *
 * Everything language-neutral (name, platform, tech, links, screenshot path)
 * lives here; the human-readable summary is an i18n key so it translates.
 * These are placeholders: swap the copy, add a `href`, and drop a screenshot
 * into `/public` (set `image`) as each case study is written up.
 */
export type Platform = "mobile" | "web";

export interface Project {
  /** Stable id; also the i18n summary key under `Work.projects.<id>`. */
  id: string;
  /** Brand/product name (not translated). */
  name: string;
  platform: Platform;
  /** Tech-stack chips, language-neutral. */
  tech: string[];
  /** Live app / store / repo link, once there is one. */
  href?: string;
  /** Screenshot under `/public` (e.g. `/projects/foo.webp`); null → placeholder. */
  image: string | null;
}

export const projects: Project[] = [
  {
    id: "mobile-1",
    name: "Project One",
    platform: "mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    image: null,
  },
  {
    id: "mobile-2",
    name: "Project Two",
    platform: "mobile",
    tech: ["React Native", "Reanimated", "Zustand"],
    image: null,
  },
  {
    id: "mobile-3",
    name: "Project Three",
    platform: "mobile",
    tech: ["React Native", "Expo Router", "React Query"],
    image: null,
  },
  {
    id: "web-1",
    name: "Web One",
    platform: "web",
    tech: ["React", "Vite", "TypeScript"],
    image: null,
  },
  {
    id: "web-2",
    name: "Web Two",
    platform: "web",
    tech: ["Next.js", "Tailwind CSS", "Motion"],
    image: null,
  },
];

/** Filters available in the Work tab: `all` plus every platform. */
export const projectFilters = ["all", "mobile", "web"] as const;

export type ProjectFilter = (typeof projectFilters)[number];

/** Returns the projects matching a filter (`all` returns everything). */
export const filterProjects = (filter: ProjectFilter): Project[] =>
  filter === "all" ? projects : projects.filter((p) => p.platform === filter);
