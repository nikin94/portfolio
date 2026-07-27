import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { submitContact } from "@/lib/contact";

import { ContactForm } from "./contact-form";

// Isolate the navigation/fetch side effect — the form's job is validation and
// state; delivery is the module's. (No beforeEach reset: each test sets its own
// implementation and asserts call counts as a delta, which sidesteps a vitest
// quirk where a per-test hook flags the component's caught rejection.)
vi.mock("@/lib/contact", () => ({
  submitContact: vi.fn(),
}));

const mockSubmit = vi.mocked(submitContact);

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const send = () =>
  fireEvent.click(screen.getByRole("button", { name: /Send message/ }));

describe("ContactForm", () => {
  it("blocks submit and shows errors when fields are empty", () => {
    render(<ContactForm />);
    const before = mockSubmit.mock.calls.length;
    send();

    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a message.")).toBeInTheDocument();
    expect(mockSubmit.mock.calls.length).toBe(before);
  });

  it("flags an invalid email", () => {
    render(<ContactForm />);
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
    render(<ContactForm />);
    fill(/Name/, "Ada Lovelace");
    fill(/Email/, "ada@example.com");
    fill(/Message/, "I'd love to talk about a React Native role.");
    send();

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenLastCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "I'd love to talk about a React Native role.",
      }),
    );
    expect(
      await screen.findByRole("button", { name: /Message sent/ }),
    ).toBeInTheDocument();
  });

  it("surfaces an error when delivery fails", async () => {
    mockSubmit.mockImplementation(async () => {
      throw new Error("boom");
    });
    render(<ContactForm />);
    fill(/Name/, "Ada");
    fill(/Email/, "ada@example.com");
    fill(/Message/, "A message long enough to pass.");
    send();

    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });
});
