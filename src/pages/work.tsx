import { t } from "@/i18n/strings";

import { ProjectGrid } from "@/components/work/project-grid";
import { Reveal } from "@/components/ui/reveal";

/**
 * Work — mobile (React Native) and web projects together, filterable by
 * platform. Cards carry placeholder copy until each case study (and its
 * screenshot) is written up.
 */
const Work = () => {
  return (
    <section className="flex flex-1 flex-col py-16">
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
      </Reveal>

      <div className="mt-12">
        <ProjectGrid />
      </div>

      <p className="text-muted mt-10 max-w-2xl text-sm text-pretty">
        {t("Work.note")}
      </p>
    </section>
  );
};

export default Work;
