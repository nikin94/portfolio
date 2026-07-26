/**
 * A badminton shuttlecock: a predominantly white feathered skirt over a cork
 * base — the way a real "birdie" looks. Uses explicit fills (not `currentColor`)
 * so it stays white in both themes; neutral outlines keep the white feathers
 * legible on light backgrounds. Decorative — hidden from assistive tech.
 */
export const Shuttle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
    focusable="false"
    className={className}
  >
    {/* feathered skirt — white cone */}
    <path
      d="M24 31 L8.5 9 Q24 2.5 39.5 9 Z"
      fill="#ffffff"
      stroke="#cbd5e1"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* individual feather ribs */}
    <path
      d="M24 31 L14 7 M24 31 L19 5.5 M24 31 L24 5 M24 31 L29 5.5 M24 31 L34 7"
      stroke="#cbd5e1"
      strokeWidth="1"
      strokeLinecap="round"
    />
    {/* string band binding the feathers */}
    <path
      d="M15 20 Q24 24.5 33 20"
      stroke="#cbd5e1"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
    {/* cork base */}
    <ellipse
      cx="24"
      cy="36.5"
      rx="7.5"
      ry="7"
      fill="#f1e2c6"
      stroke="#cbd5e1"
      strokeWidth="1.1"
    />
    <path
      d="M17 33.5 Q24 30.5 31 33.5"
      stroke="#d8c39a"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
