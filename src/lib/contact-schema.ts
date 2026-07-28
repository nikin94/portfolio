/**
 * The single contact-form validation contract, imported by BOTH the browser
 * form and the Cloudflare Worker (`worker/index.ts`) — so the field limits and
 * the email regex physically can't drift between client and server.
 *
 * Framework-neutral: no React, no config, no DOM. `validateContact` returns
 * error *codes* (not translated copy) so the client can map them to i18n
 * strings while the server just rejects.
 */
export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

/** Error codes, keyed per field — mapped to `Contact.form.errors.<code>` copy. */
export type ContactErrorCode =
  | "nameRequired"
  | "nameLong"
  | "emailRequired"
  | "emailInvalid"
  | "messageRequired"
  | "messageShort"
  | "messageLong";

export type ContactErrors = Partial<
  Record<keyof ContactValues, ContactErrorCode>
>;

export const NAME_MAX = 100;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;

/**
 * Deliberately loose email check — enough to catch typos, not to police RFC
 * 5321. It forbids whitespace (`[^\s@]`), which also stops CR/LF header
 * injection when the address is later used as an email `Reply-To`.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate trimmed values; empty result means the submission is well-formed. */
export const validateContact = (v: ContactValues): ContactErrors => {
  const e: ContactErrors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const message = v.message.trim();

  if (!name) e.name = "nameRequired";
  else if (name.length > NAME_MAX) e.name = "nameLong";

  if (!email) e.email = "emailRequired";
  else if (!EMAIL_RE.test(email)) e.email = "emailInvalid";

  if (!message) e.message = "messageRequired";
  else if (message.length < MESSAGE_MIN) e.message = "messageShort";
  else if (message.length > MESSAGE_MAX) e.message = "messageLong";

  return e;
};
