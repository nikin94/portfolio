import { Globe, Smartphone } from "lucide-react";
import { t } from "@/i18n/strings";

import type { Project } from "@/config/projects";

import { DeviceFrame } from "./device-frame";

/**
 * A single project tile: a framed screenshot (or a placeholder until one
 * lands), the name, a platform badge, the translated summary and tech chips.
 * Renders as a link when the project has an `href`, otherwise a plain article.
 */
export const ProjectCard = ({ project }: { project: Project }) => {
  const { name, platform, tech, href, image, id } = project;
  const PlatformIcon = platform === "mobile" ? Smartphone : Globe;

  const media = (
    <div className="grid aspect-[4/3] place-items-center px-8 py-6">
      <DeviceFrame platform={platform}>
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted/50 grid h-full w-full place-items-center">
            <PlatformIcon className="size-8" aria-hidden />
          </div>
        )}
      </DeviceFrame>
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
    </div>
  );

  const className =
    "border-border bg-background/40 hover:border-foreground/20 flex h-full flex-col overflow-hidden rounded-2xl border transition-colors";

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
