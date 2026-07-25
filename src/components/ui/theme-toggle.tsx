import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { useMounted } from "@/hooks/use-mounted";

/**
 * Light/dark toggle. Renders a stable placeholder until mounted to avoid a
 * hydration mismatch (the resolved theme is only known on the client).
 */
export const ThemeToggle = () => {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("Common.toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-border hover:bg-foreground/5 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors"
    >
      {mounted ? (isDark ? "☀️" : "🌙") : null}
    </button>
  );
};
