import { ArrowUpRight, Globe, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "@/i18n/strings";

import type { Project } from "@/config/projects";

import { DeviceFrame } from "./device-frame";

/**
 * A single project tile: a framed screenshot (or a placeholder until one
 * lands), the name, a platform badge, the summary and tech chips.
 *
 * A project with a `slug` links to its in-site case study (`/work/<slug>`); one
 * with only an `href` links out; otherwise it's a plain, non-interactive card.
 */
export const ProjectCard = ({ project }: { project: Project }) => {
  const { name, platform, tech, href, slug, image, id } = project;
  const PlatformIcon = platform === "mobile" ? Smartphone : Globe;

  const media = (
    <div className="aspect-[4/3] px-8 py-6">
      {image ? (
        <div className="grid h-full place-items-center">
          <DeviceFrame platform={platform}>
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </DeviceFrame>
        </div>
      ) : (
        // Placeholder (no screenshot yet): a full-width dashed panel rather than
        // a thin device sliver, so the empty card doesn't read as too narrow.
        // Temporary — these cards go away once every project has a case study.
        <div className="border-border bg-muted/5 text-muted/40 grid h-full w-full place-items-center rounded-2xl border border-dashed">
          <PlatformIcon className="size-8" aria-hidden />
        </div>
      )}
    </div>
  );

  const body = (
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold tracking-tight">{name}</h3>
        <span className="border-border text-muted flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
          <PlatformIcon className="size-3" aria-hidden />
          {t(`Work.filters.${platform}`)}
        </span>
      </div>
      <p className="text-muted mt-2 flex-1 text-sm text-pretty">
        {t(`Work.projects.${id}`)}
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {tech.map((item) => (
          <li
            key={item}
            className="bg-foreground/5 text-muted rounded-md px-2 py-0.5 text-xs"
          >
            {item}
          </li>
        ))}
      </ul>
      {slug && (
        <span className="text-accent mt-4 inline-flex items-center gap-1 text-sm font-medium">
          {t("Work.viewCaseStudy")}
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );

  const className =
    "border-border bg-background/40 hover:border-foreground/20 flex h-full flex-col overflow-hidden rounded-2xl border transition-colors";

  if (slug) {
    return (
      <Link to={`/work/${slug}`} className={className} aria-label={name}>
        {media}
        {body}
      </Link>
    );
  }

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={name}
    >
      {media}
      {body}
    </a>
  ) : (
    <article className={className}>
      {media}
      {body}
    </article>
  );
};
