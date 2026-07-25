import { motion } from "motion/react";

import { fadeInUp, staggerContainer } from "@/lib/motion";

/**
 * Reveals its children with a staggered fade-in the first time it scrolls
 * into view. Direct children animate individually when wrapped in
 * `motion` elements; here we keep it simple and animate the container.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      <motion.div variants={fadeInUp}>{children}</motion.div>
    </motion.div>
  );
}
