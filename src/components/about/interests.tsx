import { useAnimate } from "motion/react";
import type { ComponentType } from "react";
import { t } from "@/i18n/strings";

import { launchShuttleRally } from "@/lib/easter-egg-events";

import { CubeIcon, KnightIcon, RacketIcon } from "./interest-icons";

type Effect = "hop" | "spin" | "rally";

interface Interest {
  Icon: ComponentType<{ className?: string }>;
  labelKey: string;
  effect: Effect;
}

/**
 * The owner's hobbies, shown on the About tab alongside bio and education. Each
 * chip plays a themed one-shot animation on tap: the knight hops an L, the cube
 * spins, and the shuttle launches a rally across the whole page.
 */
const INTERESTS: Interest[] = [
  { Icon: KnightIcon, labelKey: "About.interests.chess", effect: "hop" },
  { Icon: CubeIcon, labelKey: "About.interests.cube", effect: "spin" },
  { Icon: RacketIcon, labelKey: "About.interests.badminton", effect: "rally" },
];

const InterestChip = ({ Icon, labelKey, effect }: Interest) => {
  const [scope, animate] = useAnimate();

  const play = () => {
    if (effect === "hop") {
      animate(
        scope.current,
        { x: [0, 10, 10, 0], y: [0, -12, 0, 0] },
        { duration: 0.5 },
      );
    } else if (effect === "spin") {
      animate(
        scope.current,
        { rotate: [0, 360] },
        { duration: 0.6, ease: "easeInOut" },
      );
    } else {
      animate(scope.current, { y: [0, -8, 0] }, { duration: 0.3 });
      launchShuttleRally();
    }
  };

  return (
    <button
      type="button"
      onClick={play}
      className="border-border hover:bg-foreground/5 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
    >
      <span ref={scope} aria-hidden className="text-foreground inline-flex">
        <Icon className="size-5" />
      </span>
      <span className="text-muted">{t(labelKey)}</span>
    </button>
  );
};

export const Interests = () => {
  return (
    <div className="mt-10">
      <p className="text-muted mb-3 text-xs tracking-widest uppercase">
        {t("About.interests.label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => (
          <InterestChip key={interest.labelKey} {...interest} />
        ))}
      </div>
    </div>
  );
};
