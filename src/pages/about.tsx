import { t } from "@/i18n/strings";

import { CareerTimeline } from "@/components/about/career-timeline";
import { Interests } from "@/components/about/interests";
import { Reveal } from "@/components/ui/reveal";

/**
 * About — the personal tab: a short bio, a career timeline that walks back from
 * the current role to graduation, and the playful interests row.
 */
const About = () => {
  return (
    <section className="flex flex-1 flex-col py-20">
      <div className="max-w-2xl">
        <Reveal>
          <p className="text-accent text-sm font-medium tracking-widest uppercase">
            {t("About.eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("About.title")}
          </h1>
          <p className="text-muted mt-6 text-lg text-pretty">
            {t("About.bio")}
          </p>
        </Reveal>

        <CareerTimeline />

        <Interests />
      </div>
    </section>
  );
};

export default About;
