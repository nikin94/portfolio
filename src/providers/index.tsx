import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Client-side provider stack shared by the whole app:
 * - `next-themes` for class-based light/dark switching (framework-agnostic)
 * - `MotionConfig` to honour the user's reduced-motion preference globally
 * - Lenis for smooth, inertial scrolling
 *
 * Lenis drives scroll via JS, so `MotionConfig`/CSS reduced-motion don't reach
 * it. We read the preference and disable smooth wheel when the user asks for
 * reduced motion, giving them native scroll (no inertia). The `ReactLenis` tree
 * stays mounted either way — only the option toggles — so hydration is stable
 * (the hook is `useSyncExternalStore`-based, server snapshot `false`).
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: !reducedMotion }}>
          {children}
        </ReactLenis>
      </MotionConfig>
    </NextThemesProvider>
  );
};
