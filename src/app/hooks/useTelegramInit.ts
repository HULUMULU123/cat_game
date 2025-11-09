import { useEffect, useRef } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import useGlobalStore from "../../shared/store/useGlobalStore";

const useTelegramInit = () => {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobalStore((s) => s.setUserFromInitData);
  const stopLoading = useGlobalStore((s) => s.stopLoading);

  // защита от повторного запуска
  const ranRef = useRef(false);

  useEffect(() => {
    if (!webApp || ranRef.current) return;
    ranRef.current = true;

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
        await setUserFromInitData(webApp.initData);
      } finally {
        if (isMounted) {
          timer = window.setTimeout(() => stopLoading(), 300);
        }
      }
    })();

    return () => {
      isMounted = false;
      if (typeof timer === "number") window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [webApp, setUserFromInitData, stopLoading]);
};

export default useTelegramInit;
