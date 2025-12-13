const LITE_QUERY_PARAM = "lite";
const FORCED_LITE_FLAG = (() => {
  if (typeof import.meta === "undefined" || typeof import.meta.env === "undefined") {
    return false;
  }
  const value = import.meta.env.VITE_FORCE_LITE_MODE;
  return value === "true" || value === true || value === "1";
})();

type TelegramWindow = Window & { Telegram?: { WebApp?: unknown } };

const getUserAgent = () => {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent?.toLowerCase?.() ?? "";
};

export const isTelegramAndroidWebView = (): boolean => {
  const ua = getUserAgent();
  if (!ua) return false;

  const isAndroid = ua.includes("android");
  const hasWvToken = ua.includes("; wv") || ua.includes(" wv") || ua.includes("version/");
  const hasTelegram =
    typeof window !== "undefined" && Boolean((window as TelegramWindow).Telegram?.WebApp);

  return isAndroid && hasWvToken && hasTelegram;
};

export const isLiteModeRequested = (): boolean => {
  if (FORCED_LITE_FLAG) return true;

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const liteFlag = params.get(LITE_QUERY_PARAM);
    if (liteFlag === "1" || liteFlag === "true") return true;
  }

  return false;
};

export const shouldUseLiteMode = (): boolean => {
  return isLiteModeRequested() || isTelegramAndroidWebView();
};

export const getLiteModeReason = (): string | null => {
  if (isLiteModeRequested()) return "lite=1 (test)";
  if (isTelegramAndroidWebView()) return "Android Telegram WebView";
  return null;
};
