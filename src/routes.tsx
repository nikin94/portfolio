import type { RouteRecord } from "vite-react-ssg";

import About from "./pages/about";
import Contact from "./pages/contact";
import Home from "./pages/home";
import RootLayout from "./pages/root-layout";
import Work from "./pages/work";

/**
 * Route tree consumed by `vite-react-ssg`.
 *
 * `RootLayout` holds the app-wide providers and shared chrome (document
 * metadata, header, tab bar). Its children are the tab sections, prerendered to
 * static `/`, `/work`, `/about` and `/contact` HTML. English is the only locale,
 * so there's no locale segment or redirect.
 */
export const routes: RouteRecord[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "work", element: <Work /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
    ],
  },
];
