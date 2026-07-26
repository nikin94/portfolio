import { Head } from "vite-react-ssg";

import { AnimatedOutlet } from "@/components/animated-outlet";
import { EasterEggs } from "@/components/easter-eggs/easter-eggs";
import { TabBar } from "@/components/tab-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
      <header className="flex items-center justify-end py-6">
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col pb-28">
        <AnimatedOutlet />
      </main>
    </div>
    <TabBar />
    <EasterEggs />
  </AppProviders>
);

export default RootLayout;
