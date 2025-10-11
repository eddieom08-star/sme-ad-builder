"use client";

import { useEffect, useState } from "react";

export type Platform = "web" | "ios" | "android";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("web");

  useEffect(() => {
    // Check if running in Capacitor
    if (typeof window !== "undefined") {
      // @ts-ignore - Capacitor is injected at runtime
      const capacitor = window.Capacitor;

      if (capacitor) {
        const platformName = capacitor.getPlatform();
        setPlatform(platformName === "ios" || platformName === "android" ? platformName : "web");
      }
    }
  }, []);

  return platform;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      setIsNative(!!window.Capacitor);
    }
  }, []);

  return isNative;
}
