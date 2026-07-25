# Portfolio

Personal portfolio of a **Mobile & Frontend developer** (React Native focus).
Built as a fast, animation-rich, statically-rendered site.

> Status: **skeleton**. Infrastructure is in place (i18n, theming, motion,
> tests); real pages/sections are added incrementally.

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
│   ├── locale-layout.tsx   # Pins i18n locale + document metadata (Head)
│   ├── root-redirect.tsx   # `/` → default locale
│   └── home.tsx            # Placeholder landing (verifies the stack)
├── components/
│   ├── language-switcher.tsx
│   └── ui/                 # Reusable primitives (Reveal, ThemeToggle, …)
├── config/
│   └── site.ts             # Site-wide metadata (name, url, locales)
├── hooks/                  # Reusable hooks (useMounted, …)
├── i18n/
│   ├── locales.ts          # Locales + default (single source of truth)
│   └── config.ts           # i18next init + per-locale cloned instances
├── lib/
│   ├── motion.ts           # Shared Motion variants
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
- Fonts use a system stack (zero network cost, no layout shift); swap for a
  self-hosted webfont once the visual design lands.
