# Portfolio

Personal portfolio of a **Mobile & Frontend developer** (React Native focus).
Built as a fast, animation-rich, statically-rendered site.

> Status: **skeleton**. Infrastructure is in place (i18n, theming, motion,
> tests); real pages/sections are added incrementally.

## Stack

| Concern       | Choice                                   | Why                                                     |
| ------------- | ---------------------------------------- | ------------------------------------------------------- |
| Framework     | **Next.js 16** (App Router, Turbopack)   | RSC, SSG/ISR, first-class SEO for the future domain     |
| Language      | **TypeScript** (strict)                  | Safety                                                  |
| Styling       | **Tailwind CSS v4** (CSS-first `@theme`) | Fast, consistent design tokens, no JS config            |
| i18n          | **next-intl 4** (`[locale]` routing)     | Type-safe, static-render friendly, EN/RU                |
| Animation     | **Motion** (ex-Framer Motion)            | Declarative, GPU transforms, reduced-motion aware       |
| Smooth scroll | **Lenis**                                | Inertial "premium" scroll, pairs with scroll animations |
| Theming       | **next-themes**                          | Class-based light/dark, respects system                 |
| Tests         | **Vitest** + Testing Library             | Fast unit/component tests                               |

3D/WebGL (React Three Fiber) is intentionally **not** included yet — it can be
added later behind a lazy boundary without touching this foundation.

## Scripts

```bash
npm run dev           # start dev server (Turbopack)
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check)
npm run test          # Vitest (run once)
npm run test:watch    # Vitest (watch)
```

## Project structure

Follows the modern App Router convention: `src/app/` holds **routes only**;
everything else lives in domain folders. Feature-specific code is colocated
with its route as the app grows.

```
src/
├── app/
│   ├── globals.css          # Tailwind entry + theme tokens + Lenis styles
│   └── [locale]/            # Locale-prefixed routes (/en, /ru)
│       ├── layout.tsx       # Root <html>, providers, metadata, SSG params
│       └── page.tsx         # Placeholder landing (verifies the stack)
├── components/
│   ├── language-switcher.tsx
│   └── ui/                  # Reusable primitives (Reveal, ThemeToggle, …)
├── config/
│   └── site.ts              # Site-wide metadata (name, url, locales)
├── hooks/                   # Reusable client hooks (useMounted, …)
├── i18n/
│   ├── routing.ts           # Locales + default (single source of truth)
│   ├── navigation.ts        # Locale-aware Link/router
│   └── request.ts           # Per-request message loading
├── lib/
│   ├── motion.ts            # Shared Motion variants
│   └── utils.ts             # cn() class merger
├── providers/
│   └── index.tsx            # ThemeProvider + MotionConfig + Lenis
└── proxy.ts                 # next-intl middleware (Next 16 "proxy" convention)

messages/
├── en.json                  # English strings
└── ru.json                  # Russian strings
```

## Internationalization

- Supported locales and the default are defined once in
  [`src/i18n/routing.ts`](src/i18n/routing.ts). Add a locale there + a matching
  `messages/<locale>.json` and it propagates through routing, navigation and
  request config.
- A test (`src/i18n/messages.test.ts`) enforces that every locale bundle has an
  identical set of keys, so translations can't silently drift.
- Use the locale-aware `Link` / `useRouter` from
  [`src/i18n/navigation.ts`](src/i18n/navigation.ts) instead of `next/*`.

## Performance & motion principles

- Animate `transform`/`opacity` only (GPU); scroll reveals use `whileInView`
  with `once: true`.
- `prefers-reduced-motion` is honoured globally via
  `<MotionConfig reducedMotion="user">` and a CSS fallback.
- Case-study media should be WebP/AVIF via `next/image` (formats preconfigured
  in `next.config.ts`).
- 3D and other heavy visuals, when added, go behind `next/dynamic` + viewport
  lazy-loading so they never block the first paint.
