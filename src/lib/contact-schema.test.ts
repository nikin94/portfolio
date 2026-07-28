import { describe, expect, it } from "vitest";

import { MESSAGE_MAX, NAME_MAX, validateContact } from "./contact-schema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I'd love to talk about a React Native role.",
};

describe("validateContact", () => {
  it("passes a well-formed submission", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("flags missing fields", () => {
    expect(validateContact({ name: "", email: "", message: "" })).toEqual({
      name: "nameRequired",
      email: "emailRequired",
      message: "messageRequired",
    });
  });

  it("flags an invalid email and rejects header-injection attempts", () => {
    expect(validateContact({ ...valid, email: "not-an-email" }).email).toBe(
      "emailInvalid",
    );
    // A CR/LF in the address can never pass — the regex forbids whitespace.
    expect(
      validateContact({ ...valid, email: "a@b.com\r\nBcc: x@y.com" }).email,
    ).toBe("emailInvalid");
  });

  it("enforces message length bounds", () => {
    expect(validateContact({ ...valid, message: "short" }).message).toBe(
      "messageShort",
    );
    expect(
      validateContact({ ...valid, message: "x".repeat(MESSAGE_MAX + 1) })
        .message,
    ).toBe("messageLong");
  });

  it("enforces the name length bound", () => {
    expect(
      validateContact({ ...valid, name: "x".repeat(NAME_MAX + 1) }).name,
    ).toBe("nameLong");
  });
});
