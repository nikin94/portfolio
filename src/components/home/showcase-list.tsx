import { Check, Plus, ShoppingBag, Star } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { t } from "@/i18n/strings";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Invented catalogue — a round thumbnail + title + meta, matching the skeleton.
 * `price`/`rating` feed the detail sheet the scripted tap opens.
 */
const PRODUCTS = [
  {
    name: "Aurora Headphones",
    meta: "$129 · Audio",
    price: "$129",
    rating: "4.9",
    glyph: "🎧",
    color: "from-violet-500/40 to-fuchsia-500/20",
  },
  {
    name: "Nomad Backpack",
    meta: "$89 · Travel",
    price: "$89",
    rating: "4.7",
    glyph: "🎒",
    color: "from-amber-500/40 to-orange-500/20",
  },
  {
    name: "Lumen Desk Lamp",
    meta: "$54 · Home",
    price: "$54",
    rating: "4.6",
    glyph: "💡",
    color: "from-yellow-400/40 to-amber-500/20",
  },
  {
    name: "Terra Bottle",
    meta: "$28 · Outdoors",
    price: "$28",
    rating: "4.8",
    glyph: "🥤",
    color: "from-emerald-500/40 to-teal-500/20",
  },
  {
    name: "Pulse Smartwatch",
    meta: "$199 · Wearables",
    price: "$199",
    rating: "4.9",
    glyph: "⌚",
    color: "from-sky-500/40 to-blue-500/20",
  },
  {
    name: "Fjord Sneakers",
    meta: "$140 · Footwear",
    price: "$140",
    rating: "4.8",
    glyph: "👟",
    color: "from-rose-500/40 to-pink-500/20",
  },
  {
    name: "Kettle Pro",
    meta: "$76 · Kitchen",
    price: "$76",
    rating: "4.5",
    glyph: "🫖",
    color: "from-red-500/40 to-orange-500/20",
  },
  {
    name: "Cloud Keyboard",
    meta: "$110 · Desk",
    price: "$110",
    rating: "4.7",
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
  </motion.div>
);

/**
 * A cart badge in the header. The count bumps with a spring bounce the moment
 * the scripted "add to cart" fires — the native "item added" beat.
 */
const CartBadge = ({ count, reduced }: { count: number; reduced: boolean }) => (
  <div className="relative">
    <ShoppingBag className="size-4 text-white/70" />
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          className="absolute -top-1.5 -right-1.5 flex min-w-3.5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[8px] font-bold text-neutral-900 tabular-nums"
          initial={reduced ? false : { scale: 0 }}
          animate={reduced ? { scale: 1 } : { scale: [0, 1.4, 1] }}
          transition={{ duration: 0.4, ease: "backOut" }}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

/**
 * The product detail sheet the tap opens: an iOS bottom sheet that slides up
 * over the list with a grab handle, the product's hero, price/rating, and an
 * "Add to cart" button that gets tapped — ticking the cart badge.
 */
const ProductSheet = ({
  product,
  added,
  reduced,
}: {
  product: (typeof PRODUCTS)[number];
  added: boolean;
  reduced: boolean;
}) => {
  return (
    <>
      {/* Scrim dimming the list behind the sheet. */}
      <motion.div
        className="absolute inset-0 z-10 bg-black/40"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-white/10 bg-neutral-900/95 px-3.5 pt-2 pb-3.5 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md"
        initial={reduced ? false : { y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        {/* Grab handle. */}
        <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-white/20" />

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl",
              product.color,
            )}
          >
            {product.glyph}
          </span>
          <div className="min-w-0 flex-1">
            {/* Name alone on its row. */}
            <p className="truncate text-sm font-semibold text-white">
              {product.name}
            </p>
            {/* In-stock over rating, in a column; price shares the row, right. */}
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-emerald-400">
                  {t("Home.showcase.list.tagline")}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/50">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="tabular-nums">{product.rating}</span>
                </span>
              </div>
              <span className="shrink-0 text-base font-semibold text-white tabular-nums">
                {product.price}
              </span>
            </div>
          </div>
        </div>

        {/* Add-to-cart button — tapped by the script, flips to "Added". */}
        <div
          className={cn(
            "relative mt-3 flex items-center justify-center gap-1.5 overflow-hidden rounded-xl py-2.5 text-xs font-semibold transition-colors",
            added
              ? "bg-emerald-400/20 text-emerald-300"
              : "bg-emerald-400 text-neutral-900",
          )}
        >
          {added ? (
            <>
              <Check className="size-4" />
              {t("Home.showcase.list.added")}
            </>
          ) : (
            <>
              <Plus className="size-4" />
              {t("Home.showcase.list.addToCart")}
            </>
          )}

          {/* Scripted tap ripple, once. */}
          {added && (
            <motion.span
              className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
              initial={reduced ? false : { scale: 0, opacity: 0.5 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

type Phase = "loading" | "loaded" | "scrolling" | "sheet" | "added";

/**
 * The scripted product-list demo. Kept as an inner component so the parent can
 * remount it (via `key`) each time the slide activates, replaying from scratch.
 * The sequence: shimmering skeletons → (1s) real product cards fade in over them
 * → the list auto-scrolls down, decelerating naturally to a stop → a tap lands
 * on one card → a detail bottom-sheet slides up → its "add to cart" is tapped,
 * ticking the cart badge. Timers only ever set state from async callbacks, so
 * there's no state-in-effect.
 */
const ListSequence = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const [phase, setPhase] = useState<Phase>(reduced ? "added" : "loading");
  const [cart, setCart] = useState(reduced ? 1 : 0);
  const y = useMotionValue(reduced ? SCROLL_Y : 0);

  useEffect(() => {
    if (reduced || !active) return;
    let controls: ReturnType<typeof animate> | undefined;
    const timers: number[] = [
      window.setTimeout(() => setPhase("loaded"), 1000),
      window.setTimeout(() => {
        setPhase("scrolling");
        // Natural deceleration: an easeOut curve slows the scroll to a stop.
        controls = animate(y, SCROLL_Y, {
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => {
            // Tap the card → the sheet slides up immediately (same beat) → after
            // a pause, add-to-cart is tapped. Chained off the actual settle.
            setPhase("sheet");
            timers.push(
              window.setTimeout(() => {
                setPhase("added");
                setCart(1);
              }, 2400),
            );
          },
        });
      }, 1800),
    ];
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      controls?.stop();
    };
  }, [active, reduced, y]);

  const showProducts = phase !== "loading";
  const showSheet = phase === "sheet" || phase === "added";
  const cardSelected =
    phase !== "loading" && phase !== "loaded" && phase !== "scrolling";

  return (
    <div aria-hidden className="flex h-full flex-col">
      <div className="mb-2.5 flex shrink-0 items-center justify-between px-1">
        <p className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
          {t("Home.showcase.list.title")}
        </p>
        <CartBadge count={cart} reduced={reduced} />
      </div>

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
                selected={cardSelected && i === SELECTED}
              />
            ))}
          </motion.div>
        )}

        {/* Detail bottom-sheet, opened by the tap. */}
        <AnimatePresence>
          {showSheet && (
            <ProductSheet
              key="sheet"
              product={PRODUCTS[SELECTED]}
              added={phase === "added"}
              reduced={reduced}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Slide 4 of the phone showcase: a product list that loads in. Skeletons resolve
 * into product cards, the list scrolls and settles, a card gets tapped and a
 * detail bottom-sheet slides up, and its "add to cart" ticks the cart badge —
 * the everyday "browse a feed, add to cart" moment. Remounts each time the slide
 * (de)activates so it replays; reduced-motion users get the settled end state.
 * Decorative — hidden from assistive tech; the tab bar carries the label.
 */
export const ShowcaseList = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <ListSequence active={active} reduced={reduced} />;
};
