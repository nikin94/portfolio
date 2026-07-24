import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Reveal } from "@/components/ui/reveal";

/**
 * Placeholder landing page. It only exists to verify the stack end-to-end
 * (i18n + theming + motion). Real sections/structure land in a later PR.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Reveal className="max-w-2xl">
        <p className="text-accent mb-4 text-sm font-medium tracking-widest uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-4xl leading-tight font-semibold text-balance sm:text-6xl">
          {t("title")}
        </h1>
        <p className="text-muted mt-6 text-lg text-pretty">{t("subtitle")}</p>
        <p className="text-muted mt-10 text-sm">{t("cta")}</p>
      </Reveal>
    </main>
  );
}
