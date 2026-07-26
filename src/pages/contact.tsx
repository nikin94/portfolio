import { t } from "@/i18n/strings";

import { Reveal } from "@/components/ui/reveal";

/**
 * Contact — links and a way to reach out. Real contact channels land here in
 * a follow-up.
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
        <p className="text-muted mt-10 text-xs">{t("Contact.cta")}</p>
      </Reveal>
    </section>
  );
};

export default Contact;
