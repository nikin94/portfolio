import { useTranslation } from "react-i18next";

import { Reveal } from "@/components/ui/reveal";

/**
 * Work — mobile (React Native) and web projects together. Case-study cards
 * with screenshots slot in here in a follow-up.
 */
const Work = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-1 flex-col justify-center py-20">
      <Reveal>
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t("Work.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("Work.title")}
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg text-pretty">
          {t("Work.subtitle")}
        </p>
        <p className="text-muted mt-10 text-xs">{t("Work.empty")}</p>
      </Reveal>
    </section>
  );
};

export default Work;
