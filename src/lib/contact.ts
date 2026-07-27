import { siteConfig } from "@/config/site";

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

/** How the message was delivered, so the UI can word its confirmation. */
export type ContactResult = "sent" | "mailto";

/**
 * Delivers a contact message.
 *
 * With a form endpoint configured (`siteConfig.contactEndpoint`) it POSTs the
 * message inline and resolves `"sent"`. With none — the default on this static,
 * backend-less site — it composes a `mailto:` to the owner and resolves
 * `"mailto"`, so the form is useful today and upgrades to inline submit the
 * moment an endpoint is set. Rejects on a non-OK response so the form can show
 * an error.
 */
export const submitContact = async (
  values: ContactValues,
): Promise<ContactResult> => {
  const endpoint = siteConfig.contactEndpoint;

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
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
