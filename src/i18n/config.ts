import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import { defaultLocale, locales } from "./locales";

/**
 * Base i18next instance. Messages are bundled (no async backend), so every
 * locale is available synchronously — which is what makes per-locale static
 * rendering reliable.
 *
 * We never mutate this instance's language at runtime. Instead each locale
 * layout wraps its subtree in an `I18nextProvider` holding a cloned instance
 * fixed to that locale (see `getLocaleI18n`). This keeps SSG renders and
 * client hydration deterministic — no `changeLanguage` side effects mid-render.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  supportedLngs: locales,
  interpolation: { escapeValue: false },
  // We drive readiness via bundled resources, so Suspense is unnecessary.
  react: { useSuspense: false },
});

const instances = new Map<string, typeof i18n>();

/**
 * Returns an i18next instance pinned to `locale`, sharing the base store.
 * Cached per locale so repeated renders reuse the same instance.
 */
export const getLocaleI18n = (locale: string) => {
  let instance = instances.get(locale);
  if (!instance) {
    instance = i18n.cloneInstance({ lng: locale });
    instances.set(locale, instance);
  }
  return instance;
};

export default i18n;
