# Portfolio

Personal portfolio of a **React Native developer**. A fast, animation-rich,
statically-rendered site — an interactive phone showcase on the home page and
per-project case studies.

## Stack

- **Vite** + **vite-react-ssg** — every route prerendered to static HTML (SEO + Open Graph previews)
- **React 19** + **React Router 6** + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` tokens)
- **Motion** for animation, **Lenis** for smooth scroll, **next-themes** for light/dark
- **React Three Fiber** / three.js for the Rubik's cube (lazy-loaded WebGL)
- **Embla** carousel, **NumberFlow** rolling digits, **yet-another-react-lightbox**
- **Vitest** + Testing Library

Copy is English-only, read synchronously from `messages/en.json` via a tiny
`t(key)` resolver (`src/i18n/strings.ts`) — no i18n runtime.

## Scripts

```bash
yarn dev            # Vite dev server
yarn build          # static site generation -> dist/
yarn preview        # serve the built dist/ locally
yarn lint           # ESLint
yarn typecheck      # tsc --noEmit
yarn format         # Prettier (write)
yarn test           # Vitest (run once)
```

## Structure

```
src/
├── main.tsx           # ViteReactSSG entry (prerender + hydrate)
├── routes.tsx         # RootLayout → /, /work, /work/:slug, /about, /contact
├── pages/             # One component per route (+ case-study.tsx)
├── components/
│   ├── tab-bar.tsx    # Liquid-glass bottom tab bar
│   ├── home/          # iPhone showcase carousel (cube · chart · Face ID · list)
│   ├── cube/          # Rubik's cube hero (lazy WebGL + static fallback)
│   ├── work/          # Project grid, cards, case-study screen gallery
│   ├── easter-eggs/   # Konami rally, shuttle, console signature
│   └── ui/            # Reusable primitives
├── config/            # nav, projects/case studies, site metadata
├── i18n/strings.ts    # t(key) resolver over messages/en.json
├── hooks/  lib/  providers/
messages/en.json       # All copy, single source of truth
```

Projects and case studies live in [`src/config/projects.ts`](src/config/projects.ts):
a project with a `slug` gets a prerendered `/work/<slug>` detail page; the rest
render as summary cards.

## Principles

- Prerendered HTML → non-empty first paint and working link previews.
- Animate `transform`/`opacity` only; `prefers-reduced-motion` honoured globally.
- three.js loads in its own lazy chunk (never in the first paint); a static
  fallback covers the server render and low-power devices.
- Case-study images are served as WebP.
