import { describe, expect, it } from "vitest";

import { advanceKonami, KONAMI_SEQUENCE } from "./konami";

/** Feed a list of keys through the reducer, returning the final progress. */
const run = (keys: string[]) =>
  keys.reduce((progress, key) => advanceKonami(progress, key), 0);

describe("advanceKonami", () => {
  it("reaches the sequence length on the full code", () => {
    expect(run([...KONAMI_SEQUENCE])).toBe(KONAMI_SEQUENCE.length);
  });

  it("is case-insensitive on letter keys", () => {
    const shouting = KONAMI_SEQUENCE.map((k) =>
      k.length === 1 ? k.toUpperCase() : k,
    );
    expect(run(shouting)).toBe(KONAMI_SEQUENCE.length);
  });

  it("resets on a wrong key", () => {
    expect(advanceKonami(3, "x")).toBe(0);
  });

  it("restarts at 1 when the wrong key is itself the first key", () => {
    // Two ArrowUps in, an ArrowUp is 'wrong' for index 2 but is a fresh start.
    expect(advanceKonami(2, "ArrowUp")).toBe(1);
  });

  it("does not fire early on a partial sequence", () => {
    expect(run([...KONAMI_SEQUENCE].slice(0, -1))).toBeLessThan(
      KONAMI_SEQUENCE.length,
    );
  });
});
