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

export const isLiteModeForced = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramLite = params.get("lite") || params.get("liteMode") || params.get("lite_mode");
    const byParam = paramLite === "1" || paramLite === "true";
    const byStorage =
      typeof window.localStorage !== "undefined" &&
      window.localStorage.getItem("forceLiteMode") === "1";
    return Boolean(byParam || byStorage);
  } catch {
    return false;
  }
};
