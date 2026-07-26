import { useTranslation } from "react-i18next";

import { CubeHero } from "@/components/cube/cube-hero";

import { PhoneFrame } from "./phone-frame";

/**
 * The Home hero: an iPhone showing app-feature demos on its screen. For now a
 * single slide — the Rubik's cube — sits on the screen; the auto-advancing,
 * swipeable carousel of further mobile-feature demos (an animated chart, a
 * Face ID unlock, a push toast, skeletons…) lands in a follow-up, slotting in
 * alongside this slide without changing the frame.
 */
export const PhoneShowcase = () => {
  const { t } = useTranslation();

  return (
    <PhoneFrame className="w-56 max-w-full sm:w-64">
      <div className="flex h-full flex-col pt-10">
        <div className="flex flex-1 items-center justify-center px-4">
          <CubeHero className="w-full" />
        </div>
        <p className="px-4 pb-7 text-center text-xs text-white/50">
          {t("Home.showcase.slides.cube")}
        </p>
      </div>
    </PhoneFrame>
  );
};
