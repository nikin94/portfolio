/**
 * Single source of truth for supported locales. Add a locale here and it
 * propagates to routing, static generation and the language switcher.
 */
export const locales = ["en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Type guard for values coming out of the URL (`useParams`). */
export function isLocale(value: string | undefined): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}
