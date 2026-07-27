import messages from "../../messages/en.json";

/**
 * The single string base. English is the only locale, so every piece of copy
 * lives in `messages/en.json` and is read synchronously — no i18n runtime, no
 * providers, no per-locale instances.
 */
type Node = string | { [key: string]: Node };

/**
 * Flatten the (static) message tree into a `dottedKey -> string` map once, at
 * module load. Every leaf becomes an entry like `"Home.showcase.list.title"`.
 */
const flatten = (node: Node, prefix: string, out: Map<string, string>) => {
  if (typeof node === "string") {
    out.set(prefix, node);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    flatten(value, prefix ? `${prefix}.${key}` : key, out);
  }
};

const strings = new Map<string, string>();
flatten(messages as Node, "", strings);

/**
 * Resolve a dotted key path ("Home.showcase.list.title") against the base.
 * An O(1) map lookup (the tree is flattened once above), with no per-call
 * `split`/`reduce`. Falls back to the key itself if it doesn't resolve, so a
 * typo shows up visibly in the UI rather than crashing the render.
 */
export const t = (key: string): string => strings.get(key) ?? key;
