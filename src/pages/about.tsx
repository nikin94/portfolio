import { Link } from "react-router-dom";
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
          <p className="text-muted/80 mt-4 text-sm text-pretty">
            {t("About.availability")}
          </p>
        </Reveal>

        <CareerTimeline />

        <Interests />

        {/* Quiet privacy link — deliberately understated (tiny, faint, well
            below the tags) so it's discoverable without competing for attention. */}
        <Link
          to="/privacy"
          className="text-muted/40 hover:text-muted mt-20 inline-block text-xs transition-colors"
        >
          {t("About.privacyLink")}
        </Link>
      </div>
    </section>
  );
};

export default About;
