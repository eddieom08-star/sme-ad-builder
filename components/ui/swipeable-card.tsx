"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
  };
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      leftAction?.color || "transparent",
      leftAction?.color || "transparent",
      "transparent",
      rightAction?.color || "transparent",
      rightAction?.color || "transparent",
    ]
  );

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -100 && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > 100 && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background actions */}
      <motion.div
        style={{ background }}
        className="absolute inset-0 flex items-center justify-between px-6"
      >
        {leftAction && (
          <div className="flex items-center space-x-2 text-white">
            {leftAction.icon}
          </div>
        )}
        {rightAction && (
          <div className="flex items-center space-x-2 text-white">
            {rightAction.icon}
          </div>
        )}
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
