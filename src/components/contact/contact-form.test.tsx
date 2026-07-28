import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { submitContact } from "@/lib/contact";

import { ContactForm } from "./contact-form";

// The form links to the privacy policy (the Turnstile disclosure), so it needs
// a router context to render.
const renderForm = () => render(<ContactForm />, { wrapper: MemoryRouter });

// Isolate the navigation/fetch side effect — the form's job is validation and
// state; delivery is the module's. (No beforeEach reset: each test sets its own
// implementation and asserts call counts as a delta, which sidesteps a vitest
// quirk where a per-test hook flags the component's caught rejection.)
vi.mock("@/lib/contact", () => ({
  submitContact: vi.fn(),
}));

// With a site key configured, the form gates submit on a Turnstile token. Stub
// the widget so it yields a token on mount, standing in for a solved challenge.
vi.mock("./turnstile", async () => {
  const { useEffect } = await import("react");
  return {
    Turnstile: ({ onToken }: { onToken: (t: string) => void }) => {
      useEffect(() => onToken("test-token"), [onToken]);
      return null;
    },
  };
});

const mockSubmit = vi.mocked(submitContact);

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const send = () =>
  fireEvent.click(screen.getByRole("button", { name: /Send message/ }));

describe("ContactForm", () => {
  it("blocks submit and shows errors when fields are empty", () => {
    renderForm();
    const before = mockSubmit.mock.calls.length;
    send();

    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a message.")).toBeInTheDocument();
    expect(mockSubmit.mock.calls.length).toBe(before);
  });

  it("moves focus to the first invalid field on submit", () => {
    renderForm();
    fill(/Name/, "Ada");
    // Email + message left empty — email is the first invalid field.
    send();

    expect(screen.getByLabelText(/Email/)).toHaveFocus();
  });

  it("flags an invalid email", () => {
    renderForm();
    fill(/Name/, "Ada");
    fill(/Email/, "not-an-email");
    fill(/Message/, "A message long enough to pass.");
    const before = mockSubmit.mock.calls.length;
    send();

    expect(
      screen.getByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(mockSubmit.mock.calls.length).toBe(before);
  });

  it("submits valid values and confirms a sent message", async () => {
    mockSubmit.mockResolvedValue("sent");
    renderForm();
    fill(/Name/, "Ada Lovelace");
    fill(/Email/, "ada@example.com");
    fill(/Message/, "I'd love to talk about a React Native role.");
    send();

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenLastCalledWith(
        {
          name: "Ada Lovelace",
          email: "ada@example.com",
          message: "I'd love to talk about a React Native role.",
        },
        expect.objectContaining({ honeypot: "" }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: /Message sent/ }),
    ).toBeInTheDocument();
  });

  it("surfaces an error when delivery fails", async () => {
    mockSubmit.mockImplementation(async () => {
      throw new Error("boom");
    });
    renderForm();
    fill(/Name/, "Ada");
    fill(/Email/, "ada@example.com");
    fill(/Message/, "A message long enough to pass.");
    send();

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });
});
