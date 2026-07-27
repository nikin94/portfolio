/**
 * Single source of truth for site-wide metadata. Update the URL once a
 * production domain is wired up.
 */
export const siteConfig = {
  name: "Serhiy — React Native Developer",
  /** Full name shown as the header wordmark. */
  author: "Serhiy Nikiforov",
  description:
    "Portfolio of a React Native developer building fast, polished cross-platform mobile apps — with modern web experiences on the side.",
  url: "https://example.com",
  /** Direct contact address — the mailto target and the Contact-tab email link. */
  email: "nikin1994@gmail.com",
  /**
   * Optional form-handling endpoint (e.g. Formspree / Web3Forms). When set, the
   * contact form POSTs to it inline; when empty it falls back to composing a
   * `mailto:` — so the form works today on a static host with no backend.
   */
  contactEndpoint: "",
  /**
   * External profile links surfaced on the Home tab. Served from `/public`
   * (the CV) or an external profile.
   */
  links: {
    cv: "/Serhiy-Nikiforov-CV.pdf",
    linkedin: "https://www.linkedin.com/in/nikin94/",
    github: "https://github.com/nikin94",
  },
} as const;

export type SiteConfig = typeof siteConfig;
