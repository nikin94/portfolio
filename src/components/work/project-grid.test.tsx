import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { filterProjects } from "@/config/projects";

import { ProjectGrid } from "./project-grid";

// A project with a slug renders as a react-router <Link>, so the grid needs a
// router context in tests.
const renderGrid = () =>
  render(
    <MemoryRouter>
      <ProjectGrid />
    </MemoryRouter>,
  );

// One card == one level-3 heading, so heading count is the visible-card count.
const cardCount = () => screen.getAllByRole("heading", { level: 3 }).length;

describe("ProjectGrid", () => {
  it("shows every project by default (matches the SSG render)", () => {
    renderGrid();
    expect(cardCount()).toBe(filterProjects("all").length);
  });

  it("narrows to mobile projects when the Mobile filter is chosen", async () => {
    renderGrid();

    fireEvent.click(screen.getByRole("tab", { name: "Mobile" }));

    // popLayout keeps exiting cards briefly; wait for the grid to settle.
    await waitFor(() =>
      expect(cardCount()).toBe(filterProjects("mobile").length),
    );
    expect(screen.getByRole("tab", { name: "Mobile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("narrows to web projects when the Web filter is chosen", async () => {
    renderGrid();

    fireEvent.click(screen.getByRole("tab", { name: "Web" }));

    await waitFor(() => expect(cardCount()).toBe(filterProjects("web").length));
  });
});
