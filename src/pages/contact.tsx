import { Mail } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { GitHubIcon, LinkedInIcon } from "@/components/home/brand-icons";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n/strings";

/**
 * Contact — the pitch, a working feedback form, and direct channels (email,
 * LinkedIn, GitHub) for anyone who'd rather reach out their own way.
 */
const Contact = () => {
  return (
    <section className="flex flex-1 flex-col justify-center py-20">
      <Reveal>
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          {t("Contact.eyebrow")}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t("Contact.title")}
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg text-pretty">
          {t("Contact.subtitle")}
        </p>

        <ContactForm />

        <h2 className="text-muted mt-8 text-xs font-medium tracking-widest uppercase">
          {t("Contact.directLabel")}
        </h2>
        <nav className="mt-3 flex flex-wrap gap-3">
          <a
            href={`mailto:${siteConfig.email}`}
            className="border-border hover:bg-foreground/5 hover:border-foreground/30 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <Mail className="size-4" aria-hidden />
            {siteConfig.email}
          </a>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="border-border hover:bg-foreground/5 hover:border-foreground/30 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <LinkedInIcon className="size-4" />
            {t("Home.links.linkedin")}
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="border-border hover:bg-foreground/5 hover:border-foreground/30 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          >
            <GitHubIcon className="size-4" />
            {t("Home.links.github")}
          </a>
        </nav>
      </Reveal>
    </section>
  );
};

export default Contact;
