import { useEffect, useRef } from "react";

import { advanceKonami, KONAMI_SEQUENCE } from "@/lib/konami";

/**
 * Fires `onUnlock` when the user enters the Konami code anywhere on the page.
 * Progress lives in a ref (no re-renders), and typing inside inputs is ignored
 * so it never interferes with real form entry.
 */
export const useKonamiCode = (onUnlock: () => void) => {
  const progress = useRef(0);
  const callback = useRef(onUnlock);

  useEffect(() => {
    callback.current = onUnlock;
  }, [onUnlock]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      progress.current = advanceKonami(progress.current, event.key);
      if (progress.current === KONAMI_SEQUENCE.length) {
        progress.current = 0;
        callback.current();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
};
