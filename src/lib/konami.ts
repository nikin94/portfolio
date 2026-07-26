/**
 * The classic Konami code. Kept as data (not baked into the hook) so the
 * matching logic stays a pure function that's trivial to unit-test.
 */
export const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

/**
 * Advances the match given the next key. Returns the new progress count.
 *
 * - A correct key moves progress forward (and returns `sequence.length` when
 *   the whole code has just been entered — the caller fires and resets).
 * - A wrong key restarts, but is forgiving: if it happens to be the first key
 *   of the sequence, progress restarts at 1 rather than 0.
 *
 * Case-insensitive on the letter keys so Caps Lock doesn't break it.
 */
export const advanceKonami = (
  progress: number,
  key: string,
  sequence: readonly string[] = KONAMI_SEQUENCE,
): number => {
  const norm = (k: string) => (k.length === 1 ? k.toLowerCase() : k);
  if (norm(key) === norm(sequence[progress])) return progress + 1;
  // Wrong key: restart, but honour a fresh first-key press.
  return norm(key) === norm(sequence[0]) ? 1 : 0;
};
