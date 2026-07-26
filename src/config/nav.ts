import { House, Mail, Rocket, UserRound, type LucideIcon } from "lucide-react";

/**
 * Single source of truth for the primary tabs. `path` is relative to the site
 * root. Add a tab here and it shows up in the tab bar and can be wired into the
 * route tree.
 */
export interface NavItem {
  /** Sub-path under `/`; empty string is the index (Home). */
  path: string;
  /** Message-base key for the visible label. */
  labelKey: string;
  Icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { path: "", labelKey: "Nav.home", Icon: House },
  { path: "work", labelKey: "Nav.work", Icon: Rocket },
  { path: "about", labelKey: "Nav.about", Icon: UserRound },
  { path: "contact", labelKey: "Nav.contact", Icon: Mail },
];
