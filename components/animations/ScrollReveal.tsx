"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  /**
   * Animation variant to use
   * @default "fadeInUp"
   */
  variant?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn" | "slideUp";
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number;
  /**
   * Animation duration (in seconds)
   * @default 0.6
   */
  duration?: number;
  /**
   * Only animate once
   * @default true
   */
  once?: boolean;
  /**
   * Amount of element that needs to be visible to trigger (0-1)
   * @default 0.1
   */
  amount?: number;
  /**
   * Custom className
   */
  className?: string;
}

const variants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
};

/**
 * ScrollReveal - Animate elements when they scroll into view
 *
 * @example
 * ```tsx
 * <ScrollReveal variant="fadeInUp" delay={0.2}>
 *   <Card>Content here</Card>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.1,
  className,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
