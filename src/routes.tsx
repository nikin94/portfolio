import type { RouteRecord } from "vite-react-ssg";

import { locales } from "./i18n/locales";
import About from "./pages/about";
import Contact from "./pages/contact";
import LocaleLayout from "./pages/locale-layout";
import RootLayout from "./pages/root-layout";
import RootRedirect from "./pages/root-redirect";
import Work from "./pages/work";

/**
 * Route tree consumed by `vite-react-ssg`.
 *
 * - Pathless `RootLayout` holds app-wide providers so they survive navigations.
 * - `/` redirects to the default locale.
 * - `/:locale` is prerendered once per locale via `getStaticPaths`, producing
 *   static `/en/` and `/ru/` HTML, and hosts the tab-based sections.
 *
 * Tabs live as children of `LocaleLayout`; `About` is the locale index.
 */
export const routes: RouteRecord[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <RootRedirect /> },
      {
        path: ":locale",
        element: <LocaleLayout />,
        getStaticPaths: () => [...locales],
        children: [
          { index: true, element: <About /> },
          { path: "work", element: <Work /> },
          { path: "contact", element: <Contact /> },
        ],
      },
    ],
  },
];
