import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { milestones } from "@/config/career";

import { CareerTimeline } from "./career-timeline";

describe("CareerTimeline", () => {
  it("renders a node per milestone", () => {
    render(<CareerTimeline />);
    expect(screen.getAllByRole("listitem")).toHaveLength(milestones.length);
  });

  it("leads with the most recent role and ends at graduation", () => {
    render(<CareerTimeline />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Pyra");
    expect(items[0]).toHaveTextContent("Senior React Native Developer");
    expect(items[items.length - 1]).toHaveTextContent(
      "MSc, Applied Mathematics",
    );
  });
});
