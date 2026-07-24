import { defineRouting } from "next-intl/routing";

/**
 * Shared routing config consumed by the middleware, the navigation APIs
 * and the request config. Add a locale here and it propagates everywhere.
 */
export const routing = defineRouting({
  locales: ["en", "ru"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
