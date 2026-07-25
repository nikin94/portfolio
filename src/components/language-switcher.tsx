import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { locales } from "@/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Minimal locale switcher. Swaps the leading `/:locale` segment of the
 * current pathname while preserving the rest of the route.
 */
export const LanguageSwitcher = () => {
  const { locale: activeLocale } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const switchTo = (locale: string) => {
    if (locale === activeLocale) return;
    // pathname is `/en` or `/en/rest` -> replace segment [1].
    const segments = pathname.split("/");
    segments[1] = locale;
    navigate(segments.join("/") || `/${locale}`, { replace: true });
  };

  return (
    <div
      aria-label={t("Common.language")}
      className="border-border flex items-center gap-1 rounded-full border p-1"
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-current={locale === activeLocale}
          onClick={() => switchTo(locale)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium uppercase transition-colors",
            locale === activeLocale
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground",
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
};
