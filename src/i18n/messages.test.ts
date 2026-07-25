import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import ru from "../../messages/ru.json";

/** Collect every leaf key path (e.g. "Home.title") from a message bundle. */
const keyPaths = (obj: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object"
      ? keyPaths(value as Record<string, unknown>, path)
      : [path];
  });

describe("message bundles", () => {
  it("have identical key sets across locales", () => {
    const enKeys = keyPaths(en).sort();
    const ruKeys = keyPaths(ru).sort();
    expect(ruKeys).toEqual(enKeys);
  });
});
