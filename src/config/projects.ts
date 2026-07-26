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
  /** When the work took place, shown in the hero. */
  year: string;
  /** Headline metrics for the hero. */
  metrics: CaseStudyMetric[];
  /** Tech stack, grouped by domain. */
  stack: TechGroup[];
  /** Screenshot gallery (mobile frames). */
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

/**
 * Case studies, keyed by slug. Only projects with an entry here get a detail
 * page; the Work grid links a card to `/work/<slug>` when its slug resolves.
 */
export const caseStudies: Record<string, CaseStudy> = {
  pyra: {
    slug: "pyra",
    name: "Pyra",
    year: "2024 — 2025",
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
    year: "2024",
    metrics: [
      { value: "~3 mo", labelKey: "Work.iovaro.metrics.speed" },
      { value: "iOS + Android", labelKey: "Work.iovaro.metrics.platforms" },
      { value: "Solo", labelKey: "Work.iovaro.metrics.ownership" },
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
    gallery: [],
    bodyKeys: [
      "Work.iovaro.body.intro",
      "Work.iovaro.body.built",
      "Work.iovaro.body.delivery",
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
