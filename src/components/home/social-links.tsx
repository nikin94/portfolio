import { FileText } from "lucide-react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";

import { siteConfig } from "@/config/site";

import { GitHubIcon, LinkedInIcon } from "./brand-icons";

interface SocialLink {
  href: string;
  labelKey: string;
  Icon: ComponentType<{ className?: string }>;
  /** Same-origin file to download (CV) vs. an external profile. */
  download?: boolean;
}

const LINKS: SocialLink[] = [
  {
    href: siteConfig.links.cv,
    labelKey: "Home.links.cv",
    Icon: FileText,
    download: true,
  },
  {
    href: siteConfig.links.linkedin,
    labelKey: "Home.links.linkedin",
    Icon: LinkedInIcon,
  },
  {
    href: siteConfig.links.github,
    labelKey: "Home.links.github",
    Icon: GitHubIcon,
  },
];

/**
 * Primary calls to action on the Home tab: CV download plus external profiles.
 * Takes the place of the old hobby chips — this is the "specialist first"
 * surface, so it leads with what a recruiter reaches for.
 */
export const SocialLinks = () => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("Home.links.label")}
      className="mt-10 flex flex-wrap gap-3"
    >
      {LINKS.map(({ href, labelKey, Icon, download }) => (
        <a
          key={labelKey}
          href={href}
          {...(download
            ? { download: true }
            : { target: "_blank", rel: "noreferrer noopener" })}
          className="border-border hover:bg-foreground/5 hover:border-foreground/30 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
        >
          <Icon className="size-4" aria-hidden />
          {t(labelKey)}
        </a>
      ))}
    </nav>
  );
};
