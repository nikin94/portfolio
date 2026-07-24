"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Minimal locale switcher. Swaps the locale while preserving the current
 * pathname via the locale-aware router.
 */
export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Common");

  return (
    <div
      aria-label={t("language")}
      className="border-border flex items-center gap-1 rounded-full border p-1"
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          disabled={isPending}
          aria-current={locale === activeLocale}
          onClick={() =>
            startTransition(() => {
              router.replace(pathname, { locale });
            })
          }
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
}
