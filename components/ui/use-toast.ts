// Simplified toast hook - you can replace with your preferred toast library
import { useState } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = "default" }: Toast) => {
    // For now, just console.log - you can integrate with Sonner or react-hot-toast
    console.log(`[${variant.toUpperCase()}] ${title}`, description);

    setToasts((prev) => [...prev, { title, description, variant }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return { toast, toasts };
}
