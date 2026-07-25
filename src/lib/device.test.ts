import { describe, expect, it } from "vitest";

import { prefersStaticCube } from "./device";

describe("prefersStaticCube", () => {
  it("prefers static when the user asks for reduced motion", () => {
    expect(
      prefersStaticCube({
        reducedMotion: true,
        hardwareConcurrency: 16,
        deviceMemory: 8,
      }),
    ).toBe(true);
  });

  it("prefers static on very low memory", () => {
    expect(prefersStaticCube({ reducedMotion: false, deviceMemory: 2 })).toBe(
      true,
    );
  });

  it("prefers static on very low core count", () => {
    expect(
      prefersStaticCube({ reducedMotion: false, hardwareConcurrency: 2 }),
    ).toBe(true);
  });

  it("runs the interactive cube on capable devices", () => {
    expect(
      prefersStaticCube({
        reducedMotion: false,
        hardwareConcurrency: 8,
        deviceMemory: 8,
      }),
    ).toBe(false);
  });

  it("runs the interactive cube when hints are unavailable", () => {
    expect(prefersStaticCube({ reducedMotion: false })).toBe(false);
  });
});
