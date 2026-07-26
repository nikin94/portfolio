import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import { getLocaleI18n } from "@/i18n/config";
import { onShuttleRally } from "@/lib/easter-egg-events";

import { Interests } from "./interests";

const renderInterests = () =>
  render(
    <I18nextProvider i18n={getLocaleI18n("en")}>
      <Interests />
    </I18nextProvider>,
  );

describe("Interests", () => {
  it("renders a chip per hobby", () => {
    renderInterests();
    expect(screen.getByRole("button", { name: /Chess/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Speedcubing/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Badminton/ }),
    ).toBeInTheDocument();
  });

  it("launches a shuttle rally when the badminton chip is tapped", () => {
    const spy = vi.fn();
    const off = onShuttleRally(spy);
    renderInterests();

    fireEvent.click(screen.getByRole("button", { name: /Badminton/ }));

    expect(spy).toHaveBeenCalledTimes(1);
    off();
  });
});
