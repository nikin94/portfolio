import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 renamed the "middleware" file convention to "proxy". next-intl
// still ships its handler under `next-intl/middleware`; only the file name
// changed.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (/_next, /_vercel)
  // - files with an extension (e.g. favicon.ico, images, fonts)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
