import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { getLocaleI18n } from "@/i18n/config";

import { SocialLinks } from "./social-links";

const renderLinks = () =>
  render(
    <I18nextProvider i18n={getLocaleI18n("en")}>
      <SocialLinks />
    </I18nextProvider>,
  );

describe("SocialLinks", () => {
  it("links to the CV, LinkedIn and GitHub from config", () => {
    renderLinks();
    expect(screen.getByRole("link", { name: /CV/ })).toHaveAttribute(
      "href",
      siteConfig.links.cv,
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      siteConfig.links.linkedin,
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      siteConfig.links.github,
    );
  });

  it("opens external profiles safely and marks the CV as a download", () => {
    renderLinks();
    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", expect.stringContaining("noopener"));

    expect(screen.getByRole("link", { name: /CV/ })).toHaveAttribute(
      "download",
    );
  });
});
