import { Check, Loader2, Send } from "lucide-react";
import { useState } from "react";

import { submitContact, type ContactValues } from "@/lib/contact";
import { t } from "@/i18n/strings";
import { cn } from "@/lib/utils";

type Field = keyof ContactValues;
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const EMPTY: ContactValues = { name: "", email: "", message: "" };

// Deliberately loose — real validation is the server's job; this only catches
// obvious typos before submitting.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE = 10;

const validate = (v: ContactValues): Errors => {
  const e: Errors = {};
  if (!v.name.trim()) e.name = t("Contact.form.errors.nameRequired");
  if (!v.email.trim()) e.email = t("Contact.form.errors.emailRequired");
  else if (!EMAIL_RE.test(v.email.trim()))
    e.email = t("Contact.form.errors.emailInvalid");
  if (!v.message.trim()) e.message = t("Contact.form.errors.messageRequired");
  else if (v.message.trim().length < MIN_MESSAGE)
    e.message = t("Contact.form.errors.messageShort");
  return e;
};

const fieldClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-foreground",
    "placeholder:text-muted/60 transition-colors outline-none",
    "focus-visible:border-accent focus-visible:ring-accent/40 focus-visible:ring-2",
    invalid ? "border-red-400/60" : "border-border",
  );

/**
 * Contact form: name, email and message with inline validation and submit
 * states (idle → sending → sent/mailto/error). Submission is handled by
 * `submitContact` — an inline POST when an endpoint is configured, otherwise a
 * `mailto:` compose — so the form works on this backend-less static site today.
 *
 * The idle markup is what the server renders, so hydration is a no-op (no
 * `opacity:0`, no layout shift); state only changes on user interaction.
 */
export const ContactForm = () => {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const sending = status === "sending";
  const done = status === "sent" || status === "mailto";

  const update = (field: Field) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  // Kept sync so React never receives (and never has to surface) a rejected
  // promise from the handler; the async delivery runs detached with its own
  // try/catch.
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setStatus("sending");
    void (async () => {
      try {
        setStatus(await submitContact(values));
        // Delivered — reset the form; the button now reads "Message sent".
        setValues(EMPTY);
      } catch {
        setStatus("error");
      }
    })();
  };

  // The button itself confirms success ("Message sent"); only a failure needs a
  // spelled-out message.
  const statusMessage = status === "error" ? t("Contact.form.error") : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 max-w-xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          field="name"
          type="text"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={update("name")}
        />
        <FormField
          field="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={update("email")}
        />
      </div>

      <div className="mt-5">
        <FieldLabel field="message" />
        <textarea
          id="contact-message"
          rows={5}
          value={values.message}
          onChange={(e) => update("message")(e.target.value)}
          placeholder={t("Contact.form.messagePlaceholder")}
          aria-invalid={!!errors.message}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          className={cn(fieldClass(!!errors.message), "min-h-32 resize-y")}
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          // Non-interactive while sending and once sent — no cursor or hover
          // feedback after delivery, only in the idle (submittable) state.
          disabled={sending || done}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium",
            "bg-foreground text-background transition-opacity",
            status === "idle" && "cursor-pointer hover:opacity-90",
            sending && "opacity-60",
          )}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : done ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          {sending
            ? t("Contact.form.sending")
            : done
              ? t("Contact.form.sent")
              : t("Contact.form.send")}
        </button>

        {statusMessage && (
          <p aria-live="polite" className="text-sm text-red-400">
            {statusMessage}
          </p>
        )}
      </div>
    </form>
  );
};

const FieldLabel = ({ field }: { field: Field }) => (
  <label
    htmlFor={`contact-${field}`}
    className="text-muted mb-1.5 block text-xs font-medium tracking-widest uppercase"
  >
    {t(`Contact.form.${field}`)}
  </label>
);

// The error line reserves its height at all times (`min-h-4`), so an error
// appearing or clearing swaps text in place instead of pushing the layout.
const FieldError = ({ id, message }: { id: string; message?: string }) => (
  <p id={id} className="mt-1.5 min-h-4 text-xs text-red-400">
    {message}
  </p>
);

const FormField = ({
  field,
  type,
  autoComplete,
  value,
  error,
  onChange,
}: {
  field: Field;
  type: string;
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <FieldLabel field={field} />
    <input
      id={`contact-${field}`}
      type={type}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t(`Contact.form.${field}Placeholder`)}
      aria-invalid={!!error}
      aria-describedby={error ? `contact-${field}-error` : undefined}
      className={fieldClass(!!error)}
    />
    <FieldError id={`contact-${field}-error`} message={error} />
  </div>
);
