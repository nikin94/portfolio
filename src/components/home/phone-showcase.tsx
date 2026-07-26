import { CubeHero } from "@/components/cube/cube-hero";

import { PhoneFrame } from "./phone-frame";
import { ShowcaseTabs } from "./showcase-tabs";

/**
 * The Home hero: an iPhone showing app-feature demos on its screen. For now a
 * single slide — the Rubik's cube — sits on the screen, with a floating
 * liquid-glass tab bar hinting at the carousel of further mobile-feature demos
 * (an animated chart, a Face ID unlock, a push toast, skeletons…) that lands in
 * a follow-up, slotting in alongside this slide without changing the frame.
 */
export const PhoneShowcase = () => (
  <PhoneFrame className="w-56 max-w-full sm:w-64">
    <div className="flex h-full items-center justify-center px-4 pt-10 pb-20">
      <CubeHero className="w-full" />
    </div>
    <ShowcaseTabs
      index={0}
      className="absolute bottom-4 left-1/2 -translate-x-1/2"
    />
  </PhoneFrame>
);
