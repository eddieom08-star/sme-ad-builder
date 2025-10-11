"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-center" | "bottom-left";
}

export function FloatingActionButton({
  icon,
  onClick,
  className,
  position = "bottom-right",
}: FloatingActionButtonProps) {
  const positionClasses = {
    "bottom-right": "bottom-20 right-4 lg:bottom-6 lg:right-6",
    "bottom-center": "bottom-20 left-1/2 -translate-x-1/2 lg:bottom-6",
    "bottom-left": "bottom-20 left-4 lg:bottom-6 lg:left-6",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "active:shadow-md transition-shadow",
        positionClasses[position],
        className
      )}
    >
      {icon}
    </motion.button>
  );
}
