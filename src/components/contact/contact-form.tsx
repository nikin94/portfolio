import { Check, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { submitContact } from "@/lib/contact";
import { validateContact, type ContactValues } from "@/lib/contact-schema";
import { siteConfig } from "@/config/site";
import { t } from "@/i18n/strings";
import { cn } from "@/lib/utils";

import { Turnstile } from "./turnstile";

type Field = keyof ContactValues;
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const EMPTY: ContactValues = { name: "", email: "", message: "" };

// Validate against the shared contract (`contact-schema`) — the exact rules the
// Worker enforces — then map each error code to its localized copy for display.
const validate = (v: ContactValues): Errors => {
  const codes = validateContact(v);
  const e: Errors = {};
  for (const field of Object.keys(codes) as Field[]) {
    e[field] = t(`Contact.form.errors.${codes[field]}`);
  }
  return e;
};

const fieldClass = (invalid: boolean) =>
  cn(
    "block w-full rounded-xl border bg-white/[0.03] px-4 py-2.5 text-sm text-foreground",
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
  // Honeypot: a hidden field only bots fill. Never rendered visibly; passed
  // through to the Worker, which silently drops the submission when it's set.
  const honeypot = useRef("");
  // When the form mounted — the Worker rejects submits that arrive implausibly
  // fast (an auto-submit), so real users need to have spent time on it. Stamped
  // in an effect (not during render) to keep the render pure; if it never runs,
  // elapsed stays large and no real submission is ever dropped.
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Turnstile is active only when a site key is configured. While active, the
  // widget yields a one-shot token the Worker verifies; submission is gated on
  // having one. `verifyPrompt` asks the user to complete it if they submit early.
  const turnstileActive = !!siteConfig.turnstileSiteKey;
  const [token, setToken] = useState<string | null>(null);
  const [verifyPrompt, setVerifyPrompt] = useState(false);

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
      // Send focus to the first field with an error (in visual order) so the
      // screen reader announces it and its message, instead of leaving focus
      // on the submit button with nothing spoken. Fields carry stable ids
      // (`contact-<field>`), so a DOM lookup avoids threading refs through.
      const firstInvalid = (["name", "email", "message"] as Field[]).find(
        (f) => found[f],
      );
      if (firstInvalid) {
        document.getElementById(`contact-${firstInvalid}`)?.focus();
      }
      return;
    }

    // Turnstile on but not solved yet — prompt for it instead of submitting.
    if (turnstileActive && !token) {
      setVerifyPrompt(true);
      return;
    }

    setStatus("sending");
    void (async () => {
      try {
        setStatus(
          await submitContact(values, {
            honeypot: honeypot.current,
            elapsedMs: Date.now() - mountedAt.current,
            turnstileToken: token ?? undefined,
          }),
        );
        // Delivered — reset the form; the button now reads "Message sent".
        setValues(EMPTY);
      } catch {
        setStatus("error");
      }
    })();
  };

  // The button itself confirms success ("Message sent"); a failure or an
  // outstanding verification each need a spelled-out message.
  const statusMessage =
    status === "error"
      ? t("Contact.form.error")
      : verifyPrompt
        ? t("Contact.form.verifyRequired")
        : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-7 max-w-xl">
      {/* Honeypot — off-screen, hidden from assistive tech and tab order. Real
          users never see or fill it; bots that auto-fill get silently dropped.
          The name (`url_extra`) and the password-manager opt-outs keep browser
          autofill away, so a real person's org name never lands here by
          accident (which would silently drop their message). */}
      <div
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-url-extra">Leave this field empty</label>
        <input
          id="contact-url-extra"
          name="url_extra"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
          onChange={(e) => (honeypot.current = e.target.value)}
        />
      </div>

      <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
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

      <div className="mt-2">
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

      {/* Cloudflare Turnstile — renders only when a site key is configured;
          otherwise a no-op. Solving it clears any outstanding verify prompt. */}
      <Turnstile
        onToken={(tok) => {
          setToken(tok);
          if (tok) setVerifyPrompt(false);
        }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <motion.button
          type="submit"
          // Non-interactive while sending and once sent — no cursor or hover
          // feedback after delivery, only in the idle (submittable) state.
          disabled={sending || done}
          // A short springy scale-pop the moment delivery lands, so the flip to
          // "Message sent" reads as a confirmation, not a silent relabel.
          animate={done ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium",
            "transition-colors",
            done
              ? "bg-emerald-500 text-white"
              : "bg-foreground text-background transition-opacity",
            status === "idle" && "cursor-pointer hover:opacity-90",
            sending && "opacity-60",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {sending ? (
              <motion.span key="sending" className="inline-flex">
                <Loader2 className="size-4 animate-spin" aria-hidden />
              </motion.span>
            ) : done ? (
              // Pops in on success — the visual "sent" feedback.
              <motion.span
                key="done"
                className="inline-flex"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <Check className="size-4" aria-hidden />
              </motion.span>
            ) : (
              <motion.span key="idle" className="inline-flex">
                <Send className="size-4" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
          {sending
            ? t("Contact.form.sending")
            : done
              ? t("Contact.form.sent")
              : t("Contact.form.send")}
        </motion.button>

        {statusMessage && (
          <p aria-live="polite" className="text-sm text-red-400">
            {statusMessage}
          </p>
        )}
      </div>

      {/* Success announcement for assistive tech. The button's flip to
          "Message sent" happens on a disabled element, which many screen
          readers don't announce — this always-present live region is populated
          on success so the confirmation is actually spoken. */}
      <p role="status" aria-live="polite" className="sr-only">
        {done ? t("Contact.form.sentStatus") : ""}
      </p>
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
