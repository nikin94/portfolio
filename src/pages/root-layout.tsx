import { Head } from "vite-react-ssg";

import { AnimatedOutlet } from "@/components/animated-outlet";
import { EasterEggs } from "@/components/easter-eggs/easter-eggs";
import { MainNav } from "@/components/main-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers";

/**
 * The single app layout: the app-wide provider stack (theme, motion, smooth
 * scroll) plus the shared chrome — document metadata, header and tab bar.
 *
 * English is the only locale, so there's no locale segment, redirect or i18n
 * provider; copy comes straight from the message base via `t`.
 */
const RootLayout = () => (
  <AppProviders>
    <ScrollToTop />
    <Head>
      <html lang="en" />
      <title>{siteConfig.name}</title>
      <meta name="description" content={siteConfig.description} />
      <meta property="og:title" content={siteConfig.name} />
      <meta property="og:description" content={siteConfig.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>

    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between gap-4 py-6">
        <span className="text-sm font-semibold tracking-widest uppercase">
          {siteConfig.author}
        </span>
        <MainNav />
      </header>
      <main className="flex flex-1 flex-col pb-16">
        <AnimatedOutlet />
      </main>
    </div>
    <EasterEggs />
  </AppProviders>
);

export default RootLayout;
