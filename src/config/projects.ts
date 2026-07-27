/**
 * Portfolio projects — the single source of truth for the Work tab.
 *
 * Everything language-neutral (name, platform, tech, links, screenshot paths,
 * metrics) lives here; human-readable prose is a string key so it stays in the
 * one message base. A project with a `slug` links to its own case-study page
 * (`/work/<slug>`); the rest render as summary cards until a case study is
 * written up.
 */
export type Platform = "mobile" | "web";

export interface Project {
  /** Stable id; also the string summary key under `Work.projects.<id>`. */
  id: string;
  /** Brand/product name (not translated). */
  name: string;
  platform: Platform;
  /** Tech-stack chips, language-neutral. */
  tech: string[];
  /** External live app / store / repo link, once there is one. */
  href?: string;
  /** When set, the card links to the in-site case study at `/work/<slug>`. */
  slug?: string;
  /** Screenshot under `/public` (e.g. `/projects/foo.webp`); null → placeholder. */
  image: string | null;
}

/** A headline number for the case-study hero (e.g. volume, growth). */
export interface CaseStudyMetric {
  value: string;
  /** String key under `Work.<slug>.metrics`. */
  labelKey: string;
}

/** A grouped block of the tech stack, so the case study reads by domain. */
export interface TechGroup {
  /** String key under `Work.<slug>.stack`. */
  labelKey: string;
  items: string[];
}

/** One screenshot in the case-study gallery. */
export interface CaseStudyShot {
  src: string;
  /** String key under `Work.<slug>.shots`. */
  captionKey: string;
}

export interface CaseStudy {
  slug: string;
  name: string;
  /** Drives the gallery frame: phone (portrait) vs. browser window. */
  platform: Platform;
  /** When the work took place, shown in the hero. */
  year: string;
  /** Headline metrics for the hero. */
  metrics: CaseStudyMetric[];
  /** Tech stack, grouped by domain. */
  stack: TechGroup[];
  /** Screenshot gallery, framed per `platform`. */
  gallery: CaseStudyShot[];
  /** Ordered prose paragraph keys under `Work.<slug>.body`. */
  bodyKeys: string[];
}

export const projects: Project[] = [
  {
    id: "pyra",
    name: "Pyra",
    platform: "mobile",
    tech: ["React Native", "Expo", "Solana", "TypeScript", "Reanimated"],
    slug: "pyra",
    image: "/projects/pyra/pyra-1.webp",
  },
  {
    id: "iovaro",
    name: "iOvaro",
    platform: "mobile",
    tech: ["React Native", "Expo", "Firebase", "Stripe", "RevenueCat"],
    slug: "iovaro",
    image: "/projects/iovaro/iovaro-1.webp",
  },
  {
    id: "pocket-caddie-ai",
    name: "Pocket Caddie AI",
    platform: "mobile",
    tech: ["React Native", "Expo", "Vision Camera", "Firebase", "AI"],
    slug: "pocket-caddie-ai",
    image: "/projects/pocket-caddie/pca-1.webp",
  },
  {
    id: "alex-motors",
    name: "Alex Motors",
    platform: "web",
    tech: ["React 19", "TypeScript", "Cloudflare Workers", "Tailwind CSS"],
    slug: "alex-motors",
    image: "/projects/alex-motors/alex-1.webp",
  },
];

/**
 * Case studies, keyed by slug. Only projects with an entry here get a detail
 * page; the Work grid links a card to `/work/<slug>` when its slug resolves.
 */
export const caseStudies: Record<string, CaseStudy> = {
  pyra: {
    slug: "pyra",
    name: "Pyra",
    platform: "mobile",
    year: "2025 — 2026",
    metrics: [
      { value: "$4.8M+", labelKey: "Work.pyra.metrics.volume" },
      { value: "96×", labelKey: "Work.pyra.metrics.growth" },
      { value: "40+", labelKey: "Work.pyra.metrics.rebuild" },
    ],
    stack: [
      {
        labelKey: "Work.pyra.stack.core",
        items: [
          "React Native 0.81",
          "Expo SDK 54",
          "New Architecture",
          "TypeScript",
          "Expo Router",
        ],
      },
      {
        labelKey: "Work.pyra.stack.solana",
        items: [
          "@solana/web3.js",
          "Pyra Labs SDK",
          "JitoSOL / JLP",
          "Bonfida .sol",
          "viem",
        ],
      },
      {
        labelKey: "Work.pyra.stack.auth",
        items: [
          "Privy embedded wallet",
          "Passkeys (WebAuthn)",
          "Face ID / Touch ID",
          "Persona (KYC)",
          "Apple Sign-In",
          "Secure Store",
        ],
      },
      {
        labelKey: "Work.pyra.stack.data",
        items: ["TanStack Query", "Zustand"],
      },
      {
        labelKey: "Work.pyra.stack.ux",
        items: [
          "Reanimated 4 + Worklets",
          "Gesture Handler",
          "gifted-charts",
          "Lottie",
          "Haptics",
        ],
      },
      {
        labelKey: "Work.pyra.stack.ops",
        items: [
          "EAS Build + OTA Updates",
          "OneSignal",
          "PostHog + Session Replay",
          "Crisp",
          "i18next",
        ],
      },
    ],
    gallery: [
      { src: "/projects/pyra/pyra-1.webp", captionKey: "Work.pyra.shots.home" },
      {
        src: "/projects/pyra/pyra-2.webp",
        captionKey: "Work.pyra.shots.portfolio",
      },
      {
        src: "/projects/pyra/pyra-3.webp",
        captionKey: "Work.pyra.shots.credit",
      },
      { src: "/projects/pyra/pyra-4.webp", captionKey: "Work.pyra.shots.card" },
      {
        src: "/projects/pyra/pyra-5.webp",
        captionKey: "Work.pyra.shots.onboarding",
      },
      { src: "/projects/pyra/pyra-6.webp", captionKey: "Work.pyra.shots.kyc" },
    ],
    bodyKeys: [
      "Work.pyra.body.intro",
      "Work.pyra.body.built",
      "Work.pyra.body.scale",
    ],
  },
  iovaro: {
    slug: "iovaro",
    name: "iOvaro",
    platform: "mobile",
    year: "2024 — 2025",
    metrics: [
      { value: "~3 mo", labelKey: "Work.iovaro.metrics.speed" },
      { value: "25+", labelKey: "Work.iovaro.metrics.screens" },
      { value: "2", labelKey: "Work.iovaro.metrics.payments" },
    ],
    stack: [
      {
        labelKey: "Work.iovaro.stack.core",
        items: [
          "React Native 0.76",
          "Expo SDK 52",
          "TypeScript",
          "React Navigation",
          "Zustand",
        ],
      },
      {
        labelKey: "Work.iovaro.stack.payments",
        items: [
          "Stripe Connect",
          "Stripe payment links",
          "RevenueCat",
          "react-native-purchases",
        ],
      },
      {
        labelKey: "Work.iovaro.stack.firebase",
        items: [
          "Firebase Auth",
          "Firestore",
          "Cloud Functions",
          "Analytics",
          "Scheduled functions",
        ],
      },
      {
        labelKey: "Work.iovaro.stack.documents",
        items: [
          "expo-print",
          "HTML PDF templates",
          "react-native-pdf",
          "expo-sharing",
          "Multi-currency",
        ],
      },
      {
        labelKey: "Work.iovaro.stack.auth",
        items: [
          "Google / Apple / Facebook",
          "OTP entry",
          "Passcode + biometrics",
          "Secure Store",
        ],
      },
      {
        labelKey: "Work.iovaro.stack.ops",
        items: [
          "EAS Build",
          "App Store + Play Store",
          "Deep linking",
          "Background fetch",
        ],
      },
    ],
    gallery: [
      {
        src: "/projects/iovaro/iovaro-1.webp",
        captionKey: "Work.iovaro.shots.onboarding",
      },
      {
        src: "/projects/iovaro/iovaro-2.webp",
        captionKey: "Work.iovaro.shots.documents",
      },
      {
        src: "/projects/iovaro/iovaro-3.webp",
        captionKey: "Work.iovaro.shots.detail",
      },
      {
        src: "/projects/iovaro/iovaro-4.webp",
        captionKey: "Work.iovaro.shots.builder",
      },
      {
        src: "/projects/iovaro/iovaro-5.webp",
        captionKey: "Work.iovaro.shots.settings",
      },
      {
        src: "/projects/iovaro/iovaro-6.webp",
        captionKey: "Work.iovaro.shots.subscription",
      },
    ],
    bodyKeys: [
      "Work.iovaro.body.intro",
      "Work.iovaro.body.built",
      "Work.iovaro.body.delivery",
    ],
  },
  "pocket-caddie-ai": {
    slug: "pocket-caddie-ai",
    name: "Pocket Caddie AI",
    platform: "mobile",
    year: "2024 — 2025",
    metrics: [
      { value: "E2E", labelKey: "Work.pocket-caddie-ai.metrics.build" },
      { value: "Pipeline", labelKey: "Work.pocket-caddie-ai.metrics.pipeline" },
      { value: "9+", labelKey: "Work.pocket-caddie-ai.metrics.screens" },
    ],
    stack: [
      {
        labelKey: "Work.pocket-caddie-ai.stack.core",
        items: [
          "React Native 0.76",
          "Expo SDK 52",
          "TypeScript",
          "React Navigation",
          "Zustand",
        ],
      },
      {
        labelKey: "Work.pocket-caddie-ai.stack.media",
        items: [
          "Vision Camera",
          "expo-video",
          "expo-video-thumbnails",
          "expo-media-library",
          "expo-image-picker",
        ],
      },
      {
        labelKey: "Work.pocket-caddie-ai.stack.ai",
        items: [
          "Cloud Functions",
          "Backend AI models",
          "Video trimming pipeline",
          "Storage uploads",
        ],
      },
      {
        labelKey: "Work.pocket-caddie-ai.stack.firebase",
        items: ["Firebase Auth", "Firestore", "Cloud Storage", "Analytics"],
      },
      {
        labelKey: "Work.pocket-caddie-ai.stack.ux",
        items: [
          "Reanimated 3",
          "gifted-charts",
          "circular-progress",
          "Range slider",
          "Linear gradient",
        ],
      },
      {
        labelKey: "Work.pocket-caddie-ai.stack.ops",
        items: [
          "Google / Apple sign-in",
          "i18next",
          "EAS Build",
          "App Store + Play Store",
        ],
      },
    ],
    gallery: [
      {
        src: "/projects/pocket-caddie/pca-1.webp",
        captionKey: "Work.pocket-caddie-ai.shots.onboarding",
      },
      {
        src: "/projects/pocket-caddie/pca-2.webp",
        captionKey: "Work.pocket-caddie-ai.shots.trim",
      },
      {
        src: "/projects/pocket-caddie/pca-3.webp",
        captionKey: "Work.pocket-caddie-ai.shots.home",
      },
      {
        src: "/projects/pocket-caddie/pca-4.webp",
        captionKey: "Work.pocket-caddie-ai.shots.analysis",
      },
      {
        src: "/projects/pocket-caddie/pca-5.webp",
        captionKey: "Work.pocket-caddie-ai.shots.drills",
      },
      {
        src: "/projects/pocket-caddie/pca-6.webp",
        captionKey: "Work.pocket-caddie-ai.shots.academy",
      },
    ],
    bodyKeys: [
      "Work.pocket-caddie-ai.body.intro",
      "Work.pocket-caddie-ai.body.built",
      "Work.pocket-caddie-ai.body.delivery",
    ],
  },
  "alex-motors": {
    slug: "alex-motors",
    name: "Alex Motors",
    platform: "web",
    year: "2026",
    metrics: [
      { value: "~75 kB", labelKey: "Work.alex-motors.metrics.bundle" },
      { value: "3 languages", labelKey: "Work.alex-motors.metrics.i18n" },
      { value: "0 cookies", labelKey: "Work.alex-motors.metrics.privacy" },
    ],
    stack: [
      {
        labelKey: "Work.alex-motors.stack.core",
        items: ["React 19", "TypeScript", "Vite 8", "Tailwind CSS v4"],
      },
      {
        labelKey: "Work.alex-motors.stack.edge",
        items: [
          "Cloudflare Workers",
          "Email Routing",
          "run_worker_first routing",
          "Wrangler",
          "Workers Builds",
        ],
      },
      {
        labelKey: "Work.alex-motors.stack.i18n",
        items: [
          "Custom typed i18n (EN / GA / RU)",
          "Bebas Neue",
          "Oswald Cyrillic (unicode-range)",
          "font-display: block",
        ],
      },
      {
        labelKey: "Work.alex-motors.stack.motion",
        items: [
          "Native CSS scroll snap",
          "IntersectionObserver reveals",
          "CSS-only neon & flicker",
          "grid-rows accordion",
          "prefers-reduced-motion",
        ],
      },
      {
        labelKey: "Work.alex-motors.stack.quality",
        items: [
          "Vitest",
          "Playwright",
          "GitHub Actions CI",
          "oxlint",
          "Shared validation contract",
        ],
      },
      {
        labelKey: "Work.alex-motors.stack.seo",
        items: [
          "schema.org AutoRepair JSON-LD",
          "ARIA tablists & live regions",
          "inert crossfade decks",
          "Honeypot anti-spam",
        ],
      },
    ],
    gallery: [
      {
        src: "/projects/alex-motors/alex-1.webp",
        captionKey: "Work.alex-motors.shots.hero",
      },
      {
        src: "/projects/alex-motors/alex-2.webp",
        captionKey: "Work.alex-motors.shots.services",
      },
      {
        src: "/projects/alex-motors/alex-3.webp",
        captionKey: "Work.alex-motors.shots.reviews",
      },
      {
        src: "/projects/alex-motors/alex-4.webp",
        captionKey: "Work.alex-motors.shots.faq",
      },
      {
        src: "/projects/alex-motors/alex-5.webp",
        captionKey: "Work.alex-motors.shots.contact",
      },
    ],
    bodyKeys: [
      "Work.alex-motors.body.intro",
      "Work.alex-motors.body.built",
      "Work.alex-motors.body.delivery",
    ],
  },
};

/** Slugs that have a case-study page — drives static path generation. */
export const caseStudySlugs = Object.keys(caseStudies);

/** Returns the case study for a slug, or `undefined` if there isn't one. */
export const getCaseStudy = (
  slug: string | undefined,
): CaseStudy | undefined => (slug ? caseStudies[slug] : undefined);

/** Filters available in the Work tab: `all` plus every platform. */
export const projectFilters = ["all", "mobile", "web"] as const;

export type ProjectFilter = (typeof projectFilters)[number];

/** Returns the projects matching a filter (`all` returns everything). */
export const filterProjects = (filter: ProjectFilter): Project[] =>
  filter === "all" ? projects : projects.filter((p) => p.platform === filter);
