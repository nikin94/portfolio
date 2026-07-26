import { useTranslation } from "react-i18next";

import { Interests } from "@/components/about/interests";
import { Reveal } from "@/components/ui/reveal";

/**
 * About — the personal tab: biography, education and hobbies. Copy is
 * placeholder for now; the interests row carries the playful hobby animations.
 */
const About = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-1 flex-col py-20">
      <Reveal className="max-w-2xl">
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t("About.eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("About.title")}
        </h1>
        <p className="text-muted mt-6 text-lg text-pretty">{t("About.bio")}</p>

        <h2 className="text-muted mt-12 text-xs font-medium tracking-widest uppercase">
          {t("About.educationLabel")}
        </h2>
        <p className="mt-3 text-pretty">{t("About.education")}</p>

        <Interests />
      </Reveal>
    </section>
  );
};

export default About;
