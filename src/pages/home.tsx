import { t } from "@/i18n/strings";

import { PhoneShowcase } from "@/components/home/phone-showcase";
import { SocialLinks } from "@/components/home/social-links";

/**
 * Home — the landing tab. Leads with the professional pitch (who I am, what I
 * build) and the primary links a recruiter reaches for (CV, LinkedIn, GitHub).
 * The Rubik's cube stays here as the signature visual.
 *
 * The hero plays a staged entrance on load (see `.hero-rise-*` in `index.css`):
 * the text rises up first, then after a short pause the phone rises in behind
 * it — so the phone has arrived by the time the 3D cube streams onto its screen,
 * reading as text → device → cube rather than a blank box waiting on three.js.
 */
const Home = () => {
  return (
    <section className="flex flex-1 flex-col justify-center gap-12 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
      <div className="hero-rise-text min-w-0 lg:max-w-xl">
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t("Home.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("Home.title")}
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg text-pretty">
          {t("Home.subtitle")}
        </p>
        <SocialLinks />
        {/* Availability badge — kept at the very bottom, below the primary
            links; the emerald dot signals "actively open" without crowding the
            top of the hero. */}
        <span className="border-border bg-foreground/5 text-muted mt-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {t("Home.badge")}
        </span>
      </div>
      <div className="hero-rise-phone flex shrink-0 justify-center lg:justify-end">
        <PhoneShowcase />
      </div>
    </section>
  );
};

export default Home;
