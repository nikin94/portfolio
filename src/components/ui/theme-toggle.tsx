import { useTheme } from "next-themes";
import { t } from "@/i18n/strings";

import { useMounted } from "@/hooks/use-mounted";

/**
 * Light/dark toggle. Renders a stable placeholder until mounted to avoid a
 * hydration mismatch (the resolved theme is only known on the client).
 */
export const ThemeToggle = () => {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  // Announce what the press will do — but only once the theme is resolved on the
  // client; before mount the direction is unknown, so fall back to the neutral
  // label (which also keeps the SSR/first-paint markup stable).
  const label = mounted
    ? t(isDark ? "Common.switchToLight" : "Common.switchToDark")
    : t("Common.toggleTheme");

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-border hover:bg-foreground/5 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors"
    >
      {mounted ? (isDark ? "☀️" : "🌙") : null}
    </button>
  );
};
