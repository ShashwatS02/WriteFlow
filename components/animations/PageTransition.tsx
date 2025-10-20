"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition - Smooth page transitions for Next.js App Router
 *
 * Wrap your page content with this component to add enter/exit animations
 *
 * @example
 * ```tsx
 * export default function Page() {
 *   return (
 *     <PageTransition>
 *       <div>Your page content</div>
 *     </PageTransition>
 *   );
 * }
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
