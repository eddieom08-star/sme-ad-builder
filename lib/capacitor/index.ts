/**
 * Capacitor Plugin Wrappers
 * These functions safely call Capacitor plugins with fallbacks for web
 */

export async function shareContent(text: string, url?: string) {
  if (typeof window === "undefined") return;

  // @ts-ignore
  const { Capacitor, Share } = window;

  if (Capacitor?.isNativePlatform()) {
    try {
      await Share.share({
        text,
        url,
        dialogTitle: "Share",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  } else {
    // Web fallback
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  }
}

export async function openUrl(url: string) {
  if (typeof window === "undefined") return;

  // @ts-ignore
  const { Capacitor, Browser } = window;

  if (Capacitor?.isNativePlatform()) {
    try {
      await Browser.open({ url });
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  } else {
    window.open(url, "_blank");
  }
}

export async function showToast(message: string) {
  if (typeof window === "undefined") return;

  // @ts-ignore
  const { Capacitor, Toast } = window;

  if (Capacitor?.isNativePlatform()) {
    try {
      await Toast.show({
        text: message,
        duration: "short",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  }
}

export async function checkNetworkStatus() {
  if (typeof window === "undefined") return { connected: true, connectionType: "wifi" };

  // @ts-ignore
  const { Capacitor, Network } = window;

  if (Capacitor?.isNativePlatform()) {
    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      console.error("Error checking network:", error);
      return { connected: navigator.onLine, connectionType: "unknown" };
    }
  }

  return { connected: navigator.onLine, connectionType: "unknown" };
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined") return false;

  // @ts-ignore
  const { Capacitor, PushNotifications } = window;

  if (Capacitor?.isNativePlatform()) {
    try {
      const permission = await PushNotifications.requestPermissions();
      return permission.receive === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  // Web fallback
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  // @ts-ignore
  return !!window.Capacitor?.isNativePlatform();
}

export function getPlatform(): "web" | "ios" | "android" {
  if (typeof window === "undefined") return "web";
  // @ts-ignore
  const platform = window.Capacitor?.getPlatform();
  return platform || "web";
}
