import { useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { AnimatedOutlet } from "@/components/animated-outlet";
import { EasterEggs } from "@/components/easter-eggs/easter-eggs";
import { MainNav } from "@/components/main-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n/strings";
import { AppProviders } from "@/providers";

/**
 * The single app layout: the app-wide provider stack (theme, motion, smooth
 * scroll) plus the shared chrome — document metadata, header and tab bar.
 *
 * English is the only locale, so there's no locale segment, redirect or i18n
 * provider; copy comes straight from the message base via `t`.
 */
const RootLayout = () => {
  // Absolute per-page URL for `og:url` + `canonical`. SSG renders each route,
  // so `pathname` is the route being prerendered — no trailing slash except the
  // home index. The og:image is absolute too (crawlers can't resolve relatives).
  const { pathname } = useLocation();
  const canonical =
    siteConfig.url + (pathname === "/" ? "" : pathname.replace(/\/$/, ""));
  const ogImage = siteConfig.url + siteConfig.ogImage;

  return (
    <AppProviders>
      <ScrollToTop />
      <Head>
        <html lang="en" />
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6">
        <header className="flex items-center justify-between gap-4 py-6">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-semibold tracking-widest uppercase">
              {siteConfig.author}
            </span>
            {/* Availability tag next to the wordmark — an emerald dot signals
                "actively open" on every page, at a glance. It drops to its own
                line on narrow screens (the wordmark wraps), and never wraps its
                own text (`whitespace-nowrap`). */}
            <span className="border-border bg-foreground/5 text-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap">
              {/* A solid dot with a soft pulsing halo — the ping is gated behind
                  `motion-safe`, so reduced-motion users just see the static dot. */}
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              {t("Nav.openToWork")}
            </span>
          </div>
          <MainNav />
        </header>
        <main className="flex flex-1 flex-col pb-16">
          <AnimatedOutlet />
        </main>
      </div>
      <EasterEggs />
    </AppProviders>
  );
};

export default RootLayout;
