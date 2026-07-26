import { t } from "@/i18n/strings";

import { PhoneShowcase } from "@/components/home/phone-showcase";
import { SocialLinks } from "@/components/home/social-links";
import { Reveal } from "@/components/ui/reveal";

/**
 * Home — the locale index / landing tab. Leads with the professional pitch
 * (who I am, what I build) and the primary links a recruiter reaches for
 * (CV, LinkedIn, GitHub). The Rubik's cube stays here as the signature visual.
 */
const Home = () => {
  return (
    <section className="flex flex-1 flex-col justify-center gap-12 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
      <Reveal className="min-w-0 lg:max-w-xl">
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
      </Reveal>
      <div className="flex shrink-0 justify-center lg:justify-end">
        <PhoneShowcase />
      </div>
    </section>
  );
};

export default Home;
