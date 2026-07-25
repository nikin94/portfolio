import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Client-side provider stack shared by the whole app:
 * - `next-themes` for class-based light/dark switching (framework-agnostic)
 * - `MotionConfig` to honour the user's reduced-motion preference globally
 * - Lenis for smooth, inertial scrolling
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  </NextThemesProvider>
);
