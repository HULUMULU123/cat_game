const safeUA = () => {
  if (typeof navigator === "undefined" || !navigator.userAgent) return "";
  return navigator.userAgent.toLowerCase();
};

export const detectAndroidTelegramWebView = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = safeUA();
  const isAndroid = ua.includes("android");
  const isWebView = ua.includes("wv") || ua.includes("version/") || ua.includes("; wv");
  const isTelegramUA = ua.includes("telegram");
  const hasTelegramObject =
    typeof (window as any).Telegram !== "undefined" &&
    typeof (window as any).Telegram.WebApp !== "undefined";

  return isAndroid && (isTelegramUA || hasTelegramObject) && isWebView;
};

export const isTelegram = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = safeUA();
  return ua.includes("telegram") || Boolean((window as any).Telegram?.WebApp);
};

export const TELEGRAM_BOT_TOKEN =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.TELEGRAM_BOT_TOKEN as string | undefined)?.trim()) ||
  "";
