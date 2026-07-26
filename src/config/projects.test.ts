import { describe, expect, it } from "vitest";

import { filterProjects, projects } from "./projects";

describe("filterProjects", () => {
  it("returns every project for 'all'", () => {
    expect(filterProjects("all")).toHaveLength(projects.length);
  });

  it("returns only mobile projects for 'mobile'", () => {
    const result = filterProjects("mobile");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.platform === "mobile")).toBe(true);
  });

  it("returns only web projects for 'web'", () => {
    const result = filterProjects("web");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.platform === "web")).toBe(true);
  });

  it("partitions all projects across platforms with no overlap", () => {
    const mobile = filterProjects("mobile").length;
    const web = filterProjects("web").length;
    expect(mobile + web).toBe(projects.length);
  });
});
