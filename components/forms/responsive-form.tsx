"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-platform";

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function ResponsiveForm({
  children,
  onSubmit,
  className,
}: ResponsiveFormProps) {
  const isMobile = useIsMobile();

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-4",
        isMobile ? "space-y-3" : "space-y-4",
        className
      )}
    >
      {children}
    </form>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("space-y-3", isMobile && "space-y-2")}>
      <div>
        <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div className={cn("space-y-3", isMobile && "space-y-2")}>{children}</div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  sticky?: boolean;
}

export function FormActions({ children, sticky = true }: FormActionsProps) {
  const isMobile = useIsMobile();

  if (isMobile && sticky) {
    return (
      <div className="sticky bottom-16 left-0 right-0 z-30 border-t bg-background p-4 lg:static lg:border-0 lg:p-0">
        <div className="flex gap-2">{children}</div>
      </div>
    );
  }

  return <div className="flex gap-2 pt-2">{children}</div>;
}
