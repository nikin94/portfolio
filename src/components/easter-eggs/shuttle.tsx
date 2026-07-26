/**
 * A stylized badminton shuttlecock: a rounded cork base and a feathered skirt.
 * Decorative — hidden from assistive tech. Uses `currentColor` so it inherits
 * whatever text colour the flying wrapper sets.
 */
export const Shuttle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
    focusable="false"
    className={className}
  >
    {/* feathered skirt */}
    <path
      d="M24 30 L8 8 M24 30 L16 6 M24 30 L24 5 M24 30 L32 6 M24 30 L40 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M9 9 Q24 -2 39 9 L32 20 Q24 16 16 20 Z"
      fill="currentColor"
      opacity="0.18"
    />
    {/* cork */}
    <circle cx="24" cy="34" r="8" fill="currentColor" />
    <circle cx="24" cy="34" r="8" stroke="currentColor" strokeWidth="1" />
  </svg>
);
