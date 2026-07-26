/**
 * A friendly, styled greeting for anyone who opens DevTools — a frequent move
 * for the engineers who vet a developer's portfolio. Nods to the hobbies and
 * hints at the hidden Konami code, without being noisy. Fires once per load.
 */
let printed = false;

export const printConsoleSignature = () => {
  if (printed || typeof console === "undefined") return;
  printed = true;

  const title = "color:#818cf8;font-size:15px;font-weight:700;padding:2px 0;";
  const body = "color:#9ca3af;font-size:12px;line-height:1.6;";
  const hint = "color:#818cf8;font-size:12px;font-weight:600;";

  console.log(
    "%c♟  🧩  🏸  — hey there, fellow dev\n%cPoking around the console? Good instinct.\nBuilt with React + Vite, statically rendered, animated with Motion.\n%c↑ ↑ ↓ ↓ ← → ← → B A",
    title,
    body,
    hint,
  );
};
