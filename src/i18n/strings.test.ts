import { describe, expect, it } from "vitest";

import { t } from "./strings";

describe("t", () => {
  it("resolves a dotted key path from the base", () => {
    expect(t("Nav.home")).toBe("Home");
    expect(t("Home.showcase.list.title")).toBe("Shop");
  });

  it("returns the key itself when it doesn't resolve to a string", () => {
    expect(t("Nope.missing")).toBe("Nope.missing");
    // A branch node (object), not a leaf string, is treated as unresolved.
    expect(t("Nav")).toBe("Nav");
  });
});
