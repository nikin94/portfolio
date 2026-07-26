import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import type { CaseStudyShot } from "@/config/projects";
import { t } from "@/i18n/strings";

import { DeviceFrame } from "./device-frame";

/**
 * The case-study screenshot gallery: device-framed thumbnails that open a
 * full-screen viewer on click. `yet-another-react-lightbox` handles the heavy
 * lifting — paging (arrows, swipe, keyboard), backdrop and focus trap — so we
 * don't hand-roll pagination. Captions come from the string base via the
 * Captions plugin.
 *
 * `open` defaults to false, so the lightbox portal renders nothing during
 * static generation / first paint — the thumbnails are the SSR content.
 */
export const ScreenGallery = ({ shots }: { shots: CaseStudyShot[] }) => {
  const [index, setIndex] = useState(-1);

  const slides = shots.map((shot) => ({
    src: shot.src,
    description: t(shot.captionKey),
  }));

  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {shots.map((shot, i) => (
          <li key={shot.src} className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t(shot.captionKey)}
              className="hover:border-foreground/30 focus-visible:ring-accent w-full cursor-pointer rounded-[1.6rem] border border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <DeviceFrame platform="mobile" className="h-72">
                <img
                  src={shot.src}
                  alt={t(shot.captionKey)}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </DeviceFrame>
            </button>
            <p className="text-muted text-center text-xs text-pretty">
              {t(shot.captionKey)}
            </p>
          </li>
        ))}
      </ul>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Captions]}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.92)" } }}
      />
    </>
  );
};
