import { CubeHero } from "@/components/cube/cube-hero";

import { PhoneFrame } from "./phone-frame";
import { ShowcaseControls } from "./showcase-controls";

/**
 * Total feature slides the showcase carousel will hold. The cube is live; the
 * animated chart, Face ID unlock and push/skeleton demos land with the
 * carousel — the page dots preview them now so the navigation reads as present.
 */
const SLIDE_COUNT = 4;

/**
 * The Home hero: an iPhone showing app-feature demos on its screen. For now a
 * single slide — the Rubik's cube — sits on the screen, with page controls
 * hinting at the swipeable carousel of further mobile-feature demos (an animated
 * chart, a Face ID unlock, a push toast, skeletons…) that lands in a follow-up,
 * slotting in alongside this slide without changing the frame.
 */
export const PhoneShowcase = () => (
  <PhoneFrame className="w-56 max-w-full sm:w-64">
    <div className="flex h-full flex-col pt-10">
      <div className="flex flex-1 items-center justify-center px-4">
        <CubeHero className="w-full" />
      </div>
      <ShowcaseControls count={SLIDE_COUNT} index={0} className="pb-7" />
    </div>
  </PhoneFrame>
);
