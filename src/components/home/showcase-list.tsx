import { Check } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Invented catalogue — a round thumbnail + title + meta, matching the skeleton. */
const PRODUCTS = [
  {
    name: "Aurora Headphones",
    meta: "$129 · Audio",
    glyph: "🎧",
    color: "from-violet-500/40 to-fuchsia-500/20",
  },
  {
    name: "Nomad Backpack",
    meta: "$89 · Travel",
    glyph: "🎒",
    color: "from-amber-500/40 to-orange-500/20",
  },
  {
    name: "Lumen Desk Lamp",
    meta: "$54 · Home",
    glyph: "💡",
    color: "from-yellow-400/40 to-amber-500/20",
  },
  {
    name: "Terra Bottle",
    meta: "$28 · Outdoors",
    glyph: "🥤",
    color: "from-emerald-500/40 to-teal-500/20",
  },
  {
    name: "Pulse Smartwatch",
    meta: "$199 · Wearables",
    glyph: "⌚",
    color: "from-sky-500/40 to-blue-500/20",
  },
  {
    name: "Fjord Sneakers",
    meta: "$140 · Footwear",
    glyph: "👟",
    color: "from-rose-500/40 to-pink-500/20",
  },
  {
    name: "Kettle Pro",
    meta: "$76 · Kitchen",
    glyph: "🫖",
    color: "from-red-500/40 to-orange-500/20",
  },
  {
    name: "Cloud Keyboard",
    meta: "$110 · Desk",
    glyph: "⌨️",
    color: "from-indigo-500/40 to-violet-500/20",
  },
];

const SKELETONS = [0, 1, 2, 3];
/** The card the scripted tap lands on — visible after the scroll settles. */
const SELECTED = 5;
/** How far the list scrolls up (px), enough to reveal the tapped card. */
const SCROLL_Y = -150;

/** A loading placeholder bar with a sweeping shimmer highlight. */
const Skeleton = ({
  className,
  animate: shimmer,
}: {
  className?: string;
  animate: boolean;
}) => (
  <div
    className={`relative overflow-hidden rounded-md bg-white/8 ${className ?? ""}`}
  >
    {shimmer && (
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
      />
    )}
  </div>
);

const ProductCard = ({
  product,
  selected,
}: {
  product: (typeof PRODUCTS)[number];
  selected: boolean;
}) => (
  <motion.div
    className={cn(
      "relative flex items-center gap-2.5 overflow-hidden rounded-xl p-2.5 transition-colors",
      // Inset ring: drawn inside the card box, so the scroll container's
      // `overflow-hidden` never clips the left/right edges of the highlight.
      selected
        ? "bg-emerald-400/15 ring-1 ring-emerald-400/60 ring-inset"
        : "bg-white/5",
    )}
    animate={selected ? { scale: [1, 0.96, 1] } : {}}
    transition={{ duration: 0.32 }}
  >
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base",
        product.color,
      )}
    >
      {product.glyph}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-medium text-white">{product.name}</p>
      <p className="truncate text-[10px] text-white/45">{product.meta}</p>
    </div>
    {selected && <Check className="size-4 shrink-0 text-emerald-400" />}

    {/* Scripted tap ripple over the thumbnail. */}
    {selected && (
      <motion.span
        className="pointer-events-none absolute top-1/2 left-4 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
        initial={{ scale: 0, opacity: 0.55 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    )}
  </motion.div>
);

type Phase = "loading" | "loaded" | "scrolling" | "selected";

/**
 * The scripted product-list demo. Kept as an inner component so the parent can
 * remount it (via `key`) each time the slide activates, replaying from scratch.
 * The sequence: shimmering skeletons → (1s) real product cards fade in over them
 * → the list auto-scrolls down, decelerating naturally to a stop → a tap ripple
 * lands on one card, which stays selected. Timers only ever set state from async
 * callbacks, so there's no state-in-effect.
 */
const ListSequence = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>(reduced ? "selected" : "loading");
  const y = useMotionValue(reduced ? SCROLL_Y : 0);

  useEffect(() => {
    if (reduced || !active) return;
    let controls: ReturnType<typeof animate> | undefined;
    const timers = [
      window.setTimeout(() => setPhase("loaded"), 1000),
      window.setTimeout(() => {
        setPhase("scrolling");
        // Natural deceleration: an easeOut curve slows the scroll to a stop.
        controls = animate(y, SCROLL_Y, {
          duration: 2,
          ease: [0.16, 1, 0.3, 1],
        });
      }, 1800),
      window.setTimeout(() => setPhase("selected"), 3900),
    ];
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      controls?.stop();
    };
  }, [active, reduced, y]);

  const showProducts = phase !== "loading";

  return (
    <div aria-hidden className="flex h-full flex-col">
      <p className="mb-2.5 shrink-0 px-1 text-[10px] font-medium tracking-widest text-white/40 uppercase">
        {t("Home.showcase.list.title")}
      </p>

      <div className="relative flex-1 overflow-hidden">
        {/* Loading skeletons, crossfading out as the products fade in. */}
        <AnimatePresence>
          {phase === "loading" && (
            <motion.div
              key="skeletons"
              className="absolute inset-x-0 top-0 flex flex-col gap-2.5"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {SKELETONS.map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5"
                >
                  <Skeleton
                    className="size-9 shrink-0 rounded-full"
                    animate={active}
                  />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-2 w-3/4" animate={active} />
                    <Skeleton className="h-2 w-1/2" animate={active} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The real list, scrolling up as it plays. */}
        {showProducts && (
          <motion.div
            className="absolute inset-x-0 top-0 flex flex-col gap-2.5"
            style={{ y }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.name}
                product={product}
                selected={phase === "selected" && i === SELECTED}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

/**
 * Slide 4 of the phone showcase: a product list that loads in. Skeletons resolve
 * into product cards, the list scrolls and settles, and a card gets tapped and
 * selected — the everyday "browse a feed" moment. Remounts each time the slide
 * (de)activates so it replays; reduced-motion users get the settled end state.
 * Decorative — hidden from assistive tech; the tab bar carries the label.
 */
export const ShowcaseList = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <ListSequence
      key={active ? "on" : "off"}
      active={active}
      reduced={reduced}
    />
  );
};
