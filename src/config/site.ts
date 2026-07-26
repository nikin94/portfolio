/**
 * Single source of truth for site-wide metadata. Update the URL once a
 * production domain is wired up.
 */
export const siteConfig = {
  name: "Serhiy — Mobile & Frontend Developer",
  /** Full name shown as the header wordmark. */
  author: "Serhiy Nikiforov",
  description:
    "Portfolio of a mobile and frontend developer specialising in React Native apps and high-performance web experiences.",
  url: "https://example.com",
  /**
   * External profile links surfaced on the Home tab. GitHub is live; the CV
   * file and LinkedIn URL are placeholders — drop a real `cv.pdf` into
   * `/public` and set the LinkedIn handle when ready.
   */
  links: {
    cv: "/cv.pdf",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/nikin94",
  },
} as const;

export type SiteConfig = typeof siteConfig;
