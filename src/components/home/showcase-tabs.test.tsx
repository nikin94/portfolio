import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";

import { getLocaleI18n } from "@/i18n/config";

import { ShowcaseTabs, showcaseTabs } from "./showcase-tabs";

const renderTabs = (props: Partial<Parameters<typeof ShowcaseTabs>[0]> = {}) =>
  render(
    <I18nextProvider i18n={getLocaleI18n("en")}>
      <ShowcaseTabs index={0} liveCount={2} {...props} />
    </I18nextProvider>,
  );

describe("ShowcaseTabs", () => {
  it("renders live tabs as buttons and previews the rest", () => {
    renderTabs();
    // Two live slides => two interactive tabs.
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    // The four icons still render (2 buttons + 2 decorative previews).
    expect(showcaseTabs).toHaveLength(4);
  });

  it("marks the active tab via aria-selected", () => {
    renderTabs({ index: 1 });
    const [cube, chart] = screen.getAllByRole("tab");
    expect(cube).toHaveAttribute("aria-selected", "false");
    expect(chart).toHaveAttribute("aria-selected", "true");
  });

  it("calls onSelect with the tab index when a live tab is clicked", () => {
    const onSelect = vi.fn();
    renderTabs({ onSelect });
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
