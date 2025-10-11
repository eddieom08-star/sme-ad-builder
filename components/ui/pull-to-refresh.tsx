"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 80], [0, 1]);
  const rotate = useTransform(y, [0, 80], [0, 180]);

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
      y.set(0);
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute left-0 right-0 top-0 flex justify-center pt-4"
      >
        <motion.div style={{ rotate }}>
          <RefreshCw
            className={`h-6 w-6 text-primary ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="h-full touch-pan-x"
      >
        {children}
      </motion.div>
    </div>
  );
}
