# Portfolio

Personal portfolio of a **Mobile & Frontend developer** (React Native focus).
Built as a fast, animation-rich, statically-rendered site.

> Status: **app-shell**. Infrastructure (i18n, theming, motion, tests) plus a
> native-style bottom tab bar and the About / Work / Contact sections are in
> place; real content is added incrementally.

## Stack

| Concern       | Choice                                   | Why                                                          |
| ------------- | ---------------------------------------- | ------------------------------------------------------------ |
| Tooling       | **Vite 8**                               | Instant dev server, fast builds, plain React DX              |
| Rendering     | **vite-react-ssg** (static generation)   | Prerenders every route to HTML → SEO + OG previews           |
| Routing       | **React Router 6** (data router)         | Familiar client routing; SSG walks the same route tree       |
| Language      | **TypeScript** (strict)                  | Safety                                                       |
| Styling       | **Tailwind CSS v4** (CSS-first `@theme`) | Fast, consistent design tokens, no JS config                 |
| i18n          | **react-i18next** (`/:locale` routing)   | Standard React i18n, EN/RU, per-locale static pages          |
| Animation     | **Motion** (ex-Framer Motion)            | Declarative, GPU transforms, reduced-motion aware            |
| Smooth scroll | **Lenis**                                | Inertial "premium" scroll, pairs with scroll animations      |
| Theming       | **next-themes**                          | Class-based light/dark, respects system (framework-agnostic) |
| Tests         | **Vitest** + Testing Library             | Fast unit/component tests                                    |

3D/WebGL (React Three Fiber) is intentionally **not** included yet — it can be
added later behind a lazy boundary without touching this foundation.

### Why SSG (and not a plain SPA)?

A plain SPA ships an empty `<div id="root">`; the prerendered HTML here means a
non-empty first paint and, more importantly, working **Open Graph previews** —
so a portfolio link shared in a chat/CV/ATS unfurls with a title, description
and image instead of a bare URL. Search ranking isn't a goal; the previews are.

## Scripts

```bash
yarn dev            # start Vite dev server
yarn build          # static site generation -> dist/
yarn preview        # serve the built dist/ locally
yarn lint           # ESLint
yarn typecheck      # tsc --noEmit
yarn format         # Prettier (write)
yarn format:check   # Prettier (check)
yarn test           # Vitest (run once)
yarn test:watch     # Vitest (watch)
```

## Project structure

`src/` holds the app; routes are plain React components composed in
`src/routes.tsx`. Feature-specific code is colocated as the app grows.

```
src/
├── main.tsx                # ViteReactSSG entry (prerender + hydrate)
├── routes.tsx              # Route tree (RootLayout → /:locale → pages)
├── index.css               # Tailwind entry + theme tokens + Lenis styles
├── pages/
│   ├── root-layout.tsx     # App-wide providers (persist across navigations)
│   ├── locale-layout.tsx   # Pins i18n locale + metadata (Head) + tab bar
│   ├── root-redirect.tsx   # `/` → default locale
│   ├── home.tsx            # Locale index: pitch + CV/LinkedIn/GitHub + cube
│   ├── work.tsx            # Mobile + web projects tab
│   ├── about.tsx           # Bio, education and hobbies
│   └── contact.tsx         # Contact tab
├── components/
│   ├── tab-bar.tsx         # Liquid-glass bottom tab bar (primary nav)
│   ├── animated-outlet.tsx # App-like per-tab enter transition
│   ├── language-switcher.tsx
│   ├── home/               # Social links (CV, LinkedIn, GitHub)
│   ├── about/              # Interests row + hobby glyphs (knight, cube)
│   ├── cube/               # Rubik's cube hero (lazy WebGL + static fallback)
│   ├── easter-eggs/        # Konami rally, shuttle, console signature
│   └── ui/                 # Reusable primitives (Reveal, ThemeToggle, …)
├── config/
│   ├── nav.ts              # Tab definitions (single source of truth)
│   ├── projects.ts         # Work-tab project data + filters
│   └── site.ts             # Site-wide metadata (name, url, links, locales)
├── hooks/                  # Reusable hooks (useMounted, usePrefersReducedMotion, …)
├── i18n/
│   ├── locales.ts          # Locales + default (single source of truth)
│   └── config.ts           # i18next init + per-locale cloned instances
├── lib/
│   ├── motion.ts           # Shared Motion variants
│   ├── device.ts           # Capability hints (interactive vs static cube)
│   └── utils.ts            # cn() class merger
└── providers/
    └── index.tsx           # ThemeProvider + MotionConfig + Lenis

messages/
├── en.json                 # English strings
└── ru.json                 # Russian strings
```

## Internationalization

- Supported locales and the default are defined once in
  [`src/i18n/locales.ts`](src/i18n/locales.ts). Add a locale there + a matching
  `messages/<locale>.json` and it propagates through routing, static generation
  and the language switcher.
- Each `/:locale` route is prerendered to its own HTML (`/en/`, `/ru/`) with the
  correct `<html lang>` and `og:locale`. The locale layout wraps its subtree in
  an `I18nextProvider` holding an instance pinned to that locale, so SSG and
  hydration stay deterministic.
- A test (`src/i18n/messages.test.ts`) enforces that every locale bundle has an
  identical set of keys, so translations can't silently drift.

## Performance & motion principles

- Animate `transform`/`opacity` only (GPU); scroll reveals use `whileInView`
  with `once: true`.
- `prefers-reduced-motion` is honoured globally via
  `<MotionConfig reducedMotion="user">` and a CSS fallback.
- Case-study media should be exported as WebP/AVIF; heavy/interactive visuals,
  when added, go behind `React.lazy` + viewport lazy-loading so they never
  block the first paint.
- The Rubik's cube hero (`components/cube/`) is the reference example: three.js
  lands in its own lazy chunk (never in the first paint), a static 3×3 fallback
  is prerendered and shown on the server / during load / for reduced-motion and
  low-power devices (which never download three.js — see `lib/device.ts`), the
  render loop pauses when scrolled out of view, and `PerformanceMonitor` lowers
  the pixel ratio if the framerate dips.
- Fonts use a system stack (zero network cost, no layout shift); swap for a
  self-hosted webfont once the visual design lands.
- The tab bar's liquid glass is a robust CSS base (`backdrop-filter` blur +
  saturate on a small fixed pill) with an SVG `feDisplacementMap` refraction as
  a **separate, progressive-enhancement overlay** — if a browser can't resolve
  the filter, the base blur is unaffected. Displacement is dropped under
  `prefers-reduced-motion`.
