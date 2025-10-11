"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
}

export function MobileActionSheet({
  open,
  onOpenChange,
  children,
  title,
}: MobileActionSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex flex-col rounded-t-[10px] border bg-background">
          <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted" />
          {title && (
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          )}
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface ActionSheetItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function ActionSheetItem({
  icon,
  children,
  onClick,
  destructive = false,
  disabled = false,
}: ActionSheetItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left transition-colors",
        "active:scale-[0.98] active:bg-muted/50",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <span className="flex-1 font-medium">{children}</span>
    </button>
  );
}
