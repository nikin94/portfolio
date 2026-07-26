/**
 * Detailed hobby glyphs for the About interests row. Custom/curated SVGs (not
 * emoji) so they read clearly at small sizes and inherit the surrounding text
 * colour via `currentColor`.
 */

/** A recognisable chess-knight silhouette, with a cut-out eye for detail. */
export const KnightIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="M5.5 21.5h13a.6.6 0 0 0 .6-.6c0-.8-.6-1.4-1.4-1.4H17c.5-2.7.3-5-.6-6.9-.9-1.9-2.4-3.3-4.2-4.3l.9-1.7a.85.85 0 0 0-.35-1.15l-.9-.45-.65 1.3-2-1.05.45 2.15C7.9 8.7 6 11 5.4 13.7c-.25 1.05.65 2 1.7 1.75l1.3-.55.75 1.4 1.75-1.2c-2.2 1.9-3.55 4-3.65 6.35H6.3c-.8 0-1.4.6-1.4 1.4 0 .33.27.6.6.6Z" />
    <circle cx="10" cy="9" r=".85" className="fill-background" />
  </svg>
);

/**
 * A 3D Rubik's cube, from Hugeicons (MIT). Stroke-based, so it inherits the
 * chip's text colour and reads clearly as an actual cube rather than a flat
 * grid.
 */
export const CubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="M8.643 3.085C10.295 2.362 11.121 2 12 2s1.705.362 3.357 1.085l1.705.747C19.687 4.982 21 5.556 21 6.5s-1.313 1.518-3.938 2.668l-1.705.747C13.705 10.638 12.879 11 12 11s-1.705-.362-3.357-1.085l-1.705-.747C4.313 8.018 3 7.444 3 6.5s1.313-1.518 3.938-2.668z" />
    <path d="M21 6.5v11c0 .944-1.313 1.518-3.938 2.668l-1.705.747C13.705 21.638 12.879 22 12 22s-1.705-.362-3.357-1.085l-1.705-.747C4.313 19.018 3 18.444 3 17.5v-11" />
    <path d="M21 12.5L12 17l-9-4m9 9V11" />
    <path d="M16.5 20V9L7 4" />
    <path d="M7.5 20V9L17 4" />
  </svg>
);
