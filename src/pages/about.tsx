import { useTranslation } from "react-i18next";

import { CubeHero } from "@/components/cube/cube-hero";
import { Reveal } from "@/components/ui/reveal";

/**
 * About — the locale index / landing tab. Intro and background copy replace
 * this placeholder once the real content is written.
 */
const About = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-1 flex-col justify-center gap-12 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
      <Reveal className="lg:max-w-xl">
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t("About.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("About.title")}
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg text-pretty">
          {t("About.subtitle")}
        </p>
        <p className="text-muted mt-10 max-w-xl text-sm text-pretty">
          {t("About.body")}
        </p>
      </Reveal>
      <div className="flex shrink-0 justify-center lg:justify-end">
        <CubeHero />
      </div>
    </section>
  );
};

export default About;
