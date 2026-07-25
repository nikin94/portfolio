import { defaultLocale, locales } from "@/i18n/locales";

/**
 * Single source of truth for site-wide metadata. Update the URL once a
 * production domain is wired up.
 */
export const siteConfig = {
  name: "Serhiy — Mobile & Frontend Developer",
  description:
    "Portfolio of a mobile and frontend developer specialising in React Native apps and high-performance web experiences.",
  url: "https://example.com",
  locales,
  defaultLocale,
} as const;

export type SiteConfig = typeof siteConfig;
