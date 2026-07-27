import { motion } from "motion/react";
import { NavLink } from "react-router-dom";

import { navItems } from "@/config/nav";
import { t } from "@/i18n/strings";
import { cn } from "@/lib/utils";

/**
 * Primary site navigation, sitting in the header (name on the left, this on the
 * right). A shared active indicator slides between items (Motion `layoutId`);
 * its resting position is derived from the URL, so the server render and client
 * hydration agree. Icons show on every width; labels appear from `sm` up, so the
 * row stays compact next to the wordmark on narrow screens.
 */
export const MainNav = () => (
  <nav aria-label={t("Nav.label")} className="flex items-center gap-0.5">
    {navItems.map(({ path, labelKey, Icon }) => (
      <NavLink
        key={labelKey}
        to={`/${path}`}
        end={path === ""}
        className={({ isActive }) =>
          cn(
            "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
            isActive ? "text-foreground" : "text-muted hover:text-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId="nav-active"
                className="bg-foreground/10 absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative size-4" aria-hidden />
            <span className="relative hidden sm:inline">{t(labelKey)}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);
