import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <span>hello world</span>
      </Reveal>,
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });
});
