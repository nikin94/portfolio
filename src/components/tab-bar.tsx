import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router-dom";

import { navItems } from "@/config/nav";
import { cn } from "@/lib/utils";

/**
 * Hidden SVG filter used by `.glass-refraction`. Turbulence displaces the
 * blurred backdrop just enough to read as a liquid lens. Rendered once; the
 * element must live in the DOM for the `url(#tabbar-liquid)` reference to
 * resolve. Purely decorative, so it's hidden from assistive tech.
 */
const GlassFilterDefs = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute h-0 w-0"
    focusable="false"
  >
    <filter
      id="tabbar-liquid"
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.006 0.011"
        numOctaves={2}
        seed={7}
        result="noise"
      />
      <feGaussianBlur in="noise" stdDeviation={1.4} result="soft" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="soft"
        scale={14}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

/**
 * Native-app-style bottom tab bar. Floats as a liquid-glass pill, slides a
 * shared active indicator between tabs (Motion `layoutId`), and preserves the
 * active locale in every link. The indicator's resting position is derived
 * from the URL, so the server render and client hydration agree.
 */
export const TabBar = () => {
  const { t } = useTranslation();
  const { locale } = useParams();

  return (
    <>
      <GlassFilterDefs />
      <nav
        aria-label={t("Nav.label")}
        className="glass-surface fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5"
      >
        <span aria-hidden className="glass-refraction" />
        {navItems.map(({ path, labelKey, Icon }) => (
          <NavLink
            key={labelKey}
            to={`/${locale}${path ? `/${path}` : ""}`}
            end={path === ""}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="tab-active"
                    className="bg-foreground/10 absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative size-4" aria-hidden />
                <span className="relative">{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};
