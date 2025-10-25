import { useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import useGlobalStore from "../../shared/store/useGlobalStore";

const useTelegramInit = () => {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobalStore((state) => state.setUserFromInitData);
  const stopLoading = useGlobalStore((state) => state.stopLoading);

  useEffect(() => {
    if (!webApp) {
      return undefined;
    }

    let isMounted = true;
    let timer: number | undefined;

    const initialize = async () => {
      webApp.ready();
      try {
        await setUserFromInitData(webApp.initData);
      } finally {
        if (isMounted) {
          timer = window.setTimeout(() => stopLoading(), 300);
        }
      }
    };

    void initialize();

    if (webApp.disableVerticalSwipes) {
      webApp.disableVerticalSwipes();
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      isMounted = false;
      if (timer) {
        window.clearTimeout(timer);
      }
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [webApp, setUserFromInitData, stopLoading]);
};

export default useTelegramInit;
