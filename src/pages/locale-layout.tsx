import { I18nextProvider } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { AnimatedOutlet } from "@/components/animated-outlet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TabBar } from "@/components/tab-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import { getLocaleI18n } from "@/i18n/config";
import { defaultLocale, isLocale } from "@/i18n/locales";

/**
 * Per-locale layout. Pins the i18next language for its subtree (via a cloned
 * instance, so SSG renders and hydration stay deterministic), sets localized
 * document metadata, and renders the shared chrome.
 */
const LocaleLayout = () => {
  const { locale } = useParams();

  // Unknown locale in the URL -> fall back to the default.
  if (!isLocale(locale)) {
    return <Navigate to={`/${defaultLocale}`} replace />;
  }

  const i18n = getLocaleI18n(locale);
  const ogLocale = locale === "ru" ? "ru_RU" : "en_US";
  const shortName = siteConfig.name.split(" — ")[0];

  return (
    <I18nextProvider i18n={i18n}>
      <Head>
        <html lang={locale} />
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={ogLocale} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <span className="text-sm font-semibold tracking-tight">
            {shortName}
          </span>
          <nav className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </header>
        <main className="flex flex-1 flex-col pb-28">
          <AnimatedOutlet />
        </main>
      </div>
      <TabBar />
    </I18nextProvider>
  );
};

export default LocaleLayout;
