import { useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import useGlobalStore from "../../shared/store/useGlobalStore";

const useTelegramInit = () => {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobalStore((s) => s.setUserFromInitData);
  const stopLoading = useGlobalStore((s) => s.stopLoading);
  const setTelegramAuthInvalid = useGlobalStore((s) => s.setTelegramAuthInvalid);

  useEffect(() => {
    let isMounted = true;
    let timer: number | undefined;
    let previousOverflow = document.body.style.overflow;
    let previousTouchAction = document.body.style.touchAction;
    let didLockBody = false;

    const getTelegramWebApp = () =>
      webApp ?? (window as any)?.Telegram?.WebApp;

    const waitForInitData = async () => {
      const maxAttempts = 10;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const tg = getTelegramWebApp();
        const initData = tg?.initData ?? (window as any)?.Telegram?.WebApp?.initData ?? "";
        if (initData && initData.includes("hash=")) {
          return { tg, initData };
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      return { tg: getTelegramWebApp(), initData: "" };
    };

    (async () => {
      const { tg, initData } = await waitForInitData();
      if (!isMounted) return;

      if (!tg || !initData || !initData.includes("hash=")) {
        setTelegramAuthInvalid(true);
        stopLoading();
        return;
      }

      // обозначаем готовность веб-приложения Telegram
      tg.ready?.();
      tg.expand?.();

      // отключим прокрутку/жесты на время загрузки
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      didLockBody = true;

      try {
        await setUserFromInitData(initData);
        if (isMounted) {
          timer = window.setTimeout(() => stopLoading(), 300);
        }
      } catch (err) {
        console.error("[auth] init failed", err);
        setTelegramAuthInvalid(true);
        // намеренно не снимаем лоадер — ждём валидные данные
      } finally {
        if (didLockBody) {
          document.body.style.overflow = previousOverflow;
          document.body.style.touchAction = previousTouchAction;
          didLockBody = false;
        }
      }
    })();

    return () => {
      isMounted = false;
      if (typeof timer === "number") window.clearTimeout(timer);
      if (didLockBody) {
        document.body.style.overflow = previousOverflow;
        document.body.style.touchAction = previousTouchAction;
      }
    };
  }, [webApp, setUserFromInitData, stopLoading, setTelegramAuthInvalid]);
};

export default useTelegramInit;
