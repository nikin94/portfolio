import { motion } from "motion/react";

import { useMounted } from "@/hooks/use-mounted";
import { fadeInUp, staggerContainer } from "@/lib/motion";

/**
 * Reveals its children with a staggered fade-in the first time it scrolls
 * into view. Direct children animate individually when wrapped in
 * `motion` elements; here we keep it simple and animate the container.
 *
 * `initial` is skipped until mount (same pattern as `animated-outlet.tsx`), so
 * the server render and first client paint show the content at rest — never
 * `opacity:0` in the static HTML. That keeps the LCP text block paintable
 * before hydration; the reveal animation only plays on client navigations,
 * where the page (and this component) mounts fresh with `mounted` already true.
 */
export const Reveal = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mounted = useMounted();

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial={mounted ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      <motion.div variants={fadeInUp}>{children}</motion.div>
    </motion.div>
  );
};
