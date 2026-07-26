import messages from "../../messages/en.json";

/**
 * The single string base. English is the only locale, so every piece of copy
 * lives in `messages/en.json` and is read synchronously — no i18n runtime, no
 * providers, no per-locale instances.
 */
type Node = string | { [key: string]: Node };

/**
 * Resolve a dotted key path ("Home.showcase.list.title") against the base.
 * Falls back to the key itself if it doesn't resolve to a string, so a typo
 * shows up visibly in the UI rather than crashing the render.
 */
export const t = (key: string): string => {
  const value = key
    .split(".")
    .reduce<Node | undefined>(
      (node, part) =>
        node && typeof node === "object" ? node[part] : undefined,
      messages as Node,
    );
  return typeof value === "string" ? value : key;
};
