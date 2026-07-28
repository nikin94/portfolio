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
  url: "https://nikin.dev",
  /** Social-share preview image (1200×630), served from `/public`. Referenced
   *  as an absolute URL (crawlers need it) built from `url` + this path. */
  ogImage: "/og.jpg",
  /** Direct contact address — the mailto target and the Contact-tab email link. */
  email: "nikin1994@gmail.com",
  /**
   * Contact-form submit endpoint. Same-origin `POST /api/contact`, handled by
   * the Cloudflare Worker (`worker/index.ts`), which validates and sends the
   * message through Email Routing. Empty would make the form fall back to a
   * `mailto:` compose (useful with no backend).
   */
  contactEndpoint: "/api/contact",
  /**
   * Cloudflare Turnstile site key (public — safe to commit). When set, the
   * contact form renders the Turnstile widget and the Worker verifies the token
   * before sending. Empty (the default) leaves the widget off, so the form still
   * works on the existing same-origin + rate-limit + honeypot layers. The paired
   * secret lives as the Worker's `TURNSTILE_SECRET` secret, never in this file.
   */
  turnstileSiteKey: "",
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
