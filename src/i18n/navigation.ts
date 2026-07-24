import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware drop-in replacements for Next.js navigation primitives.
 * Use these instead of `next/link` / `next/navigation` so links keep the
 * active locale prefix automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
