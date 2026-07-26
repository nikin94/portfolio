import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { ScreenGallery } from "@/components/work/screen-gallery";
import { Reveal } from "@/components/ui/reveal";
import { getCaseStudy } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n/strings";

/**
 * A project case-study page at `/work/<slug>`. Data-driven from `caseStudies`
 * (see `config/projects.ts`) with prose in the string base — a hero with
 * headline metrics, a narrative, the grouped tech stack and a screenshot
 * gallery. Slugs without a case study fall back to the Work grid.
 */
const CaseStudy = () => {
  const { slug } = useParams();
  const study = getCaseStudy(slug);

  // Unknown slug -> back to the Work grid rather than a dead page.
  if (!study) return <Navigate to="/work" replace />;

  const base = `Work.${study.slug}`;
  const title = `${study.name} — ${siteConfig.author}`;

  return (
    <section className="flex flex-1 flex-col py-16">
      <Head>
        <title>{title}</title>
        <meta name="description" content={t(`${base}.summary`)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t(`${base}.summary`)} />
      </Head>

      <Link
        to="/work"
        className="text-muted hover:text-foreground mb-10 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("Work.back")}
      </Link>

      <Reveal>
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t(`${base}.eyebrow`)}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {study.name}
        </h1>
        <p className="text-muted mt-2 text-sm">{study.year}</p>
        <p className="text-muted mt-6 text-lg text-pretty">
          {t(`${base}.summary`)}
        </p>
      </Reveal>

      {/* Headline metrics. */}
      <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {study.metrics.map((metric) => (
          <div
            key={metric.labelKey}
            className="border-border bg-background/40 rounded-2xl border p-5"
          >
            <dt className="text-accent text-3xl font-semibold tracking-tight tabular-nums">
              {metric.value}
            </dt>
            <dd className="text-muted mt-1 text-sm text-pretty">
              {t(metric.labelKey)}
            </dd>
          </div>
        ))}
      </dl>

      {/* Narrative. */}
      <div className="mt-14 space-y-5">
        {study.bodyKeys.map((key) => (
          <p key={key} className="leading-relaxed text-pretty">
            {t(key)}
          </p>
        ))}
      </div>

      {/* Screenshot gallery — click a screen to open the full-screen viewer. */}
      <h2 className="mt-16 text-lg font-semibold tracking-tight">
        {t("Work.gallery")}
      </h2>
      <ScreenGallery shots={study.gallery} />

      {/* Grouped tech stack. */}
      <h2 className="mt-16 text-lg font-semibold tracking-tight">
        {t("Work.stack")}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {study.stack.map((group) => (
          <div key={group.labelKey}>
            <p className="text-muted text-xs font-medium tracking-widest uppercase">
              {t(group.labelKey)}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="bg-foreground/5 text-muted rounded-md px-2 py-0.5 text-xs"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CaseStudy;
