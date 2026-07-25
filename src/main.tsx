import { ViteReactSSG } from "vite-react-ssg";

import "./i18n/config";
import "./index.css";
import { routes } from "./routes";

/**
 * SSG-aware entry. `ViteReactSSG` prerenders every route to static HTML at
 * build time and hydrates it on the client — the same routes power dev.
 */
export const createRoot = ViteReactSSG({ routes });
