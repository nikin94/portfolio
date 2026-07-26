import NumberFlow from "@number-flow/react";
import { Check, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const SCAN_MS = 1500;
const UNLOCK_HOLD_MS = 2300;
/** Matches the 3D flip duration below. */
const FLIP_MS = 600;
/** The confirm bar only starts once the flip to the card has finished. */
const CONFIRM_START_MS = UNLOCK_HOLD_MS + FLIP_MS;
/** A touch longer so the confirm bar reads clearly before it resolves. */
const CONFIRM_BAR_MS = 1700;
const PAID_MS = CONFIRM_START_MS + CONFIRM_BAR_MS;

/** Balance before/after the payment — the difference rolls in on "paid". */
const BALANCE = 12480.5;
const PAYMENT = 4.2;
const BALANCE_FORMAT = { style: "currency", currency: "USD" } as const;

/** The rounded Face ID reticle brackets (four corners). */
const CORNERS = [
  "M8 26V14a6 6 0 0 1 6-6h12", // top-left
  "M64 26V14a6 6 0 0 0-6-6H46", // top-right
  "M8 46v12a6 6 0 0 0 6 6h12", // bottom-left
  "M64 46v12a6 6 0 0 1-6 6H46", // bottom-right
];

type Phase = "scan" | "unlocked" | "flip" | "paying" | "paid";

/** The Face ID reticle that frames a face and sweeps a scan line over it. */
const FaceIdReticle = ({
  scanned,
  scanning,
}: {
  scanned: boolean;
  /** Sweep the scan line only while actively scanning (not before the sequence
   *  has started, so it stays in sync with the unlock timer). */
  scanning: boolean;
}) => (
  <svg viewBox="0 0 72 72" className="size-full overflow-visible">
    <defs>
      <clipPath id="faceid-reticle">
        <rect x="8" y="8" width="56" height="56" rx="14" />
      </clipPath>
    </defs>

    {/* Reticle corners — emerald once unlocked. */}
    {CORNERS.map((d) => (
      <motion.path
        key={d}
        d={d}
        fill="none"
        stroke={scanned ? "#34d399" : "#e5e7eb"}
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ stroke: scanned ? "#34d399" : "#e5e7eb" }}
        transition={{ duration: 0.4 }}
      />
    ))}

    {/* Simple face: eyes + smile. */}
    <g
      stroke={scanned ? "#34d399" : "#d1d5db"}
      strokeWidth={2.6}
      strokeLinecap="round"
      fill="none"
    >
      <path d="M28 30v4" />
      <path d="M44 30v4" />
      <path d="M29 44c2.4 2.6 5 4 7 4s4.6-1.4 7-4" />
    </g>

    {/* Scan line sweeping the face while scanning. */}
    {scanning && (
      <g clipPath="url(#faceid-reticle)">
        <motion.line
          x1="8"
          x2="64"
          stroke="#34d399"
          strokeWidth={2}
          initial={{ y1: 12, y2: 12, opacity: 0 }}
          animate={{
            y1: [12, 60, 12],
            y2: [12, 60, 12],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 4px #34d399)" }}
        />
      </g>
    )}
  </svg>
);

/**
 * The card the biometric unlock reveals: a stylised payment card with a balance
 * that de-blurs once it's yours to see (Face ID cleared it), then a confirm bar
 * that runs and resolves to "Paid". Amount/holder are static; only the balance
 * animates.
 */
const PaymentCard = ({
  revealed,
  paying,
  paid,
  reduced,
}: {
  revealed: boolean;
  paying: boolean;
  paid: boolean;
  reduced: boolean;
}) => {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {/* The card. */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 p-3 shadow-lg">
        {/* Sheen. */}
        <span className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/15 blur-2xl" />

        <div className="flex items-start justify-between">
          <span className="h-5 w-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400" />
          <Wifi className="size-4 rotate-90 text-white/70" />
        </div>

        <div className="mt-2.5">
          <p className="text-[9px] tracking-widest text-white/50 uppercase">
            Balance
          </p>
          {/* De-blurs once Face ID clears it, then the payment rolls off the
              balance slot-machine style (NumberFlow — iOS-like odometer digits;
              it honours reduced motion and renders a static value on the
              server). */}
          <motion.div
            className="text-lg leading-tight font-semibold text-white tabular-nums"
            initial={reduced ? false : { filter: "blur(7px)", opacity: 0.5 }}
            animate={{
              filter: revealed ? "blur(0px)" : "blur(7px)",
              opacity: revealed ? 1 : 0.5,
            }}
            transition={{ duration: 0.5 }}
          >
            <NumberFlow
              value={paid ? BALANCE - PAYMENT : BALANCE}
              format={BALANCE_FORMAT}
              trend={-1}
            />
          </motion.div>
        </div>

        <div className="mt-2.5 flex items-end justify-between">
          <p className="font-mono text-xs tracking-widest text-white/80">
            •••• 4242
          </p>
          <p className="text-[9px] tracking-wide text-white/60 uppercase">
            S. Nikiforov
          </p>
        </div>
      </div>

      {/* Confirmation row. */}
      <div className="rounded-xl bg-white/5 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Coffee · DemoApp</span>
          <span className="text-sm font-semibold text-white tabular-nums">
            $4.20
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            initial={reduced ? false : { width: "0%" }}
            animate={{ width: paid ? "100%" : paying ? "70%" : "0%" }}
            transition={{
              duration: paid ? 0.35 : 1,
              ease: paid ? "easeOut" : "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * The sequence itself. Kept as an inner component so the parent can remount it
 * (via `key`) whenever the slide becomes active — that replays it from scratch
 * without resetting state inside an effect. Timers advance the phases; reduced
 * motion jumps straight to the paid end state.
 */
const PaymentSequence = ({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>(reduced ? "paid" : "scan");

  useEffect(() => {
    if (reduced || !active) return;
    const timers = [
      window.setTimeout(() => setPhase("unlocked"), SCAN_MS),
      // Flip to the card first; the confirm bar only starts once it lands.
      window.setTimeout(() => setPhase("flip"), UNLOCK_HOLD_MS),
      window.setTimeout(() => setPhase("paying"), CONFIRM_START_MS),
      window.setTimeout(() => setPhase("paid"), PAID_MS),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, reduced]);

  const scanned = phase !== "scan";
  const showCard = phase === "flip" || phase === "paying" || phase === "paid";
  const paid = phase === "paid";

  const status = paid
    ? t("Home.showcase.faceid.paid")
    : phase === "paying"
      ? t("Home.showcase.faceid.confirming")
      : phase === "unlocked" || phase === "flip"
        ? t("Home.showcase.faceid.unlocked")
        : t("Home.showcase.faceid.scanning");

  return (
    <div
      aria-hidden
      className="flex h-full flex-col items-center justify-center gap-6"
    >
      {/* 3D flip: Face ID on the front, the payment card on the back. */}
      <div className="relative h-52 w-full" style={{ perspective: 900 }}>
        <motion.div
          className="relative size-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: showCard ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Front — Face ID reticle. */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative size-36">
              <FaceIdReticle scanned={scanned} scanning={active && !scanned} />
              <AnimatePresence>
                {scanned && (
                  <motion.div
                    className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Check className="size-4 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Back — payment card. */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <PaymentCard
              revealed={showCard}
              paying={phase === "paying"}
              paid={paid}
              reduced={reduced}
            />
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5 text-center">
        {paid && <Check className="size-4 text-emerald-400" strokeWidth={3} />}
        <motion.p
          key={status}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            scanned ? "text-xs text-emerald-400" : "text-xs text-white/40"
          }
        >
          {status}
        </motion.p>
      </div>
    </div>
  );
};

/**
 * Slide 3 of the phone showcase: a Face ID unlock that flows into a payment.
 * A reticle frames a face while a scan line sweeps it; on completion it flips
 * in 3D to a payment card whose balance de-blurs (Face ID cleared it to see),
 * a confirm bar runs, and it settles on "Paid" — the everyday biometric →
 * secure-payment moment of a native app.
 *
 * Re-plays each time the slide becomes active (remounted via `key`); reduced-
 * motion users get the paid end state with no animation. Decorative — hidden
 * from assistive tech; the tab bar carries the label.
 */
export const ShowcaseFaceId = ({ active }: { active: boolean }) => {
  const reduced = usePrefersReducedMotion();
  return <PaymentSequence active={active} reduced={reduced} />;
};
