import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n/strings";

/** Cloudflare's addendum, referenced from the spam-protection section — required
 *  disclosure for using Turnstile (especially the invisible widget mode). */
const TURNSTILE_ADDENDUM =
  "https://www.cloudflare.com/en-gb/turnstile-privacy-policy/";

/**
 * Privacy policy. Kept short and honest — the site sets no cookies and runs no
 * trackers, so this mostly covers the one place data is collected (the contact
 * form) and the third parties involved in delivering it (Cloudflare Turnstile +
 * edge hosting). The Turnstile Privacy Addendum link is the disclosure Cloudflare
 * requires when the anti-spam widget is enabled.
 */
const Privacy = () => {
  const title = `${t("Privacy.title")} — ${siteConfig.author}`;

  return (
    <section className="flex flex-1 flex-col py-16">
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("Privacy.intro")} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t("Privacy.intro")} />
      </Head>

      <Link
        to="/"
        className="text-muted hover:text-foreground mb-10 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("Nav.home")}
      </Link>

      <div className="max-w-2xl">
        <Reveal>
          <p className="text-accent text-sm font-medium tracking-widest uppercase">
            {t("Privacy.eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("Privacy.title")}
          </h1>
          <p className="text-muted mt-2 text-sm">{t("Privacy.updated")}</p>
          <p className="text-muted mt-6 text-lg text-pretty">
            {t("Privacy.intro")}
          </p>
        </Reveal>

        <div className="mt-12 space-y-10">
          <Section title={t("Privacy.form.title")}>
            {t("Privacy.form.body")}
          </Section>

          <Section title={t("Privacy.spam.title")}>
            {t("Privacy.spam.body")}{" "}
            <a
              href={TURNSTILE_ADDENDUM}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent hover:text-foreground font-medium underline underline-offset-2 transition-colors"
            >
              {t("Privacy.spam.addendumLink")}
            </a>
            .
          </Section>

          <Section title={t("Privacy.hosting.title")}>
            {t("Privacy.hosting.body")}
          </Section>

          <Section title={t("Privacy.contact.title")}>
            {t("Privacy.contact.body")}{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-accent hover:text-foreground font-medium underline underline-offset-2 transition-colors"
            >
              {siteConfig.email}
            </a>
            .
          </Section>
        </div>
      </div>
    </section>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-muted text-xs font-medium tracking-widest uppercase">
      {title}
    </h2>
    <p className="mt-3 leading-relaxed text-pretty">{children}</p>
  </div>
);

export default Privacy;
