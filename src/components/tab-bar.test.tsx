import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { getLocaleI18n } from "@/i18n/config";

import { TabBar } from "./tab-bar";

// English i18n regardless of URL locale, so labels are stable while we assert
// locale-dependent hrefs separately.
const renderAt = (path: string) =>
  render(
    <I18nextProvider i18n={getLocaleI18n("en")}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:locale/*" element={<TabBar />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );

describe("TabBar", () => {
  it("renders a link per tab with localized labels", () => {
    renderAt("/en");
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("marks the current tab active via aria-current", () => {
    renderAt("/en/work");
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the active locale in every tab href", () => {
    renderAt("/ru");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/ru",
    );
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "href",
      "/ru/work",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/ru/contact",
    );
  });
});
