import { useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import useGlobalStore from "../../shared/store/useGlobalStore";

const useTelegramInit = () => {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobalStore((s) => s.setUserFromInitData);
  const stopLoading = useGlobalStore((s) => s.stopLoading);
  const setTelegramAuthInvalid = useGlobalStore((s) => s.setTelegramAuthInvalid);

  useEffect(() => {
    const initData = webApp?.initData ?? (window as any)?.Telegram?.WebApp?.initData ?? "";

    if (!webApp || !initData || !initData.includes("hash=")) {
      setTelegramAuthInvalid(true);
      stopLoading();
      return;
    }

    // обозначаем готовность веб-приложения Telegram
    webApp.ready();

    let isMounted = true;
    let timer: number | undefined;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    // отключим прокрутку/жесты на время загрузки
    if (webApp.disableVerticalSwipes) webApp.disableVerticalSwipes();
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    (async () => {
      try {
        await setUserFromInitData(initData);
        if (isMounted) {
          timer = window.setTimeout(() => stopLoading(), 300);
        }
      } catch (err) {
        console.error("[auth] init failed", err);
        setTelegramAuthInvalid(true);
        // намеренно не снимаем лоадер — ждём валидные данные
      }
    })();

    return () => {
      isMounted = false;
      if (typeof timer === "number") window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [webApp, setUserFromInitData, stopLoading, setTelegramAuthInvalid]);
};

export default useTelegramInit;
