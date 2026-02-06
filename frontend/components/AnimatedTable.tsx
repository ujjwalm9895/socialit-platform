"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTableProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedTable({ children, className = "" }: AnimatedTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white shadow rounded-lg overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedTableRowProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedTableRow({
  children,
  index,
  className = "",
}: AnimatedTableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)", scale: 1.01 }}
      className={className}
    >
      {children}
    </motion.tr>
  );
}
