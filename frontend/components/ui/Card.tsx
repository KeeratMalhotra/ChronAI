"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type CardSize = "sm" | "md" | "lg";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  hover?: boolean;
  accent?: boolean;
  size?: CardSize;
  className?: string;
}

const sizeStyles: Record<CardSize, string> = {
  sm: "p-3 rounded-lg",
  md: "p-4 rounded-xl",
  lg: "p-6 rounded-2xl",
};

export function Card({
  children,
  hover = true,
  accent = false,
  size = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        border bg-[var(--surface)]
        transition-colors duration-200
        ${sizeStyles[size]}
        ${accent ? "border-accent-400/20" : "border-[var(--border-subtle)]"}
        ${hover ? "hover:bg-[var(--surface-hover)] hover:border-[var(--border)]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Card;
