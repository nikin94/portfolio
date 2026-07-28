import { siteConfig } from "@/config/site";

import type { ContactValues } from "./contact-schema";

export type { ContactValues } from "./contact-schema";

/** How the message was delivered, so the UI can word its confirmation. */
export type ContactResult = "sent" | "mailto";

/**
 * Delivers a contact message.
 *
 * With an endpoint configured (`siteConfig.contactEndpoint` → `/api/contact`,
 * the Cloudflare Worker) it POSTs the message inline and resolves `"sent"`;
 * `honeypot` carries the hidden anti-spam field verbatim. With none it composes
 * a `mailto:` and resolves `"mailto"`, so the form still works on a backend-less
 * host. Rejects on a non-OK response so the form can show an error.
 */
export const submitContact = async (
  values: ContactValues,
  honeypot = "",
): Promise<ContactResult> => {
  const endpoint = siteConfig.contactEndpoint;

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...values, company: honeypot }),
    });
    if (!res.ok) throw new Error(`Contact endpoint returned ${res.status}`);
    return "sent";
  }

  const subject = encodeURIComponent(`Portfolio enquiry from ${values.name}`);
  const body = encodeURIComponent(
    `${values.message}\n\n— ${values.name} <${values.email}>`,
  );
  window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  return "mailto";
};
