import { Mail, Rocket, UserRound, type LucideIcon } from "lucide-react";

/**
 * Single source of truth for the primary tabs. `path` is relative to the
 * locale segment (`/:locale`). Add a tab here and it shows up in the tab bar
 * and can be wired into the route tree.
 */
export interface NavItem {
  /** Sub-path under `/:locale`; empty string is the locale index (About). */
  path: string;
  /** i18n key for the visible label. */
  labelKey: string;
  Icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { path: "", labelKey: "Nav.about", Icon: UserRound },
  { path: "work", labelKey: "Nav.work", Icon: Rocket },
  { path: "contact", labelKey: "Nav.contact", Icon: Mail },
];
