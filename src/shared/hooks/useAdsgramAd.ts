import { useCallback, useState } from "react";
import { useAdsgram } from "@adsgram/react";

import useGlobalStore from "../store/useGlobalStore";

export type AdsgramStatus = "idle" | "showing" | "completed" | "error";

type AdsgramHookResult = {
  status: AdsgramStatus;
  error: string | null;
  isLoading: boolean;
  startAdFlow: (blockId: string) => Promise<void>;
  reset: () => void;

  // старые методы оставлены, чтобы ничего не ломать, но теперь всё время кидают ошибку
  requestAssignment: () => never;
  confirmAssignment: () => never;
};

const useAdsgramAd = (): AdsgramHookResult => {
  const { show } = useAdsgram(); // главное отличие
  const tokens = useGlobalStore((s) => s.tokens);
  const refreshBalance = useGlobalStore((s) => s.refreshBalance);

  const [status, setStatus] = useState<AdsgramStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestAssignment = () => {
    throw new Error(
      "requestAssignment больше не используется. Используйте startAdFlow(blockId)."
    );
  };

  const confirmAssignment = () => {
    throw new Error(
      "confirmAssignment больше не используется. Используйте startAdFlow(blockId)."
    );
  };

  const startAdFlow = useCallback(
    async (blockId: string) => {
      if (!tokens?.access) {
        setStatus("error");
        const msg = "Необходимо авторизоваться, чтобы смотреть рекламу.";
        setError(msg);
        throw new Error(msg);
      }

      if (!blockId) {
        setStatus("error");
        const msg = "blockId обязателен.";
        setError(msg);
        throw new Error(msg);
      }

      try {
        setStatus("showing");
        setError(null);

        await show({ blockId }); // 🔥 вызов встроенного React SDK

        setStatus("completed");

        await refreshBalance();
      } catch (err: any) {
        const message =
          err?.description || err?.message || "Ошибка показа рекламы";

        setStatus("error");
        setError(message);
        throw err;
      }
    },
    [show, tokens, refreshBalance]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    isLoading: status === "showing",
    startAdFlow,
    reset,
    requestAssignment,
    confirmAssignment,
  };
};

export default useAdsgramAd;
