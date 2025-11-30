import { useCallback, useMemo, useState } from "react";

import { ApiError, request } from "../api/httpClient";
import type { AdsgramAssignmentResponse } from "../api/types";
import useGlobalStore from "../store/useGlobalStore";

export type AdsgramStatus =
  | "idle"
  | "requesting"
  | "awaiting"
  | "confirming"
  | "completed"
  | "error";

type AdsgramHookResult = {
  status: AdsgramStatus;
  assignment: AdsgramAssignmentResponse | null;
  error: string | null;
  isLoading: boolean;
  requestAssignment: (
    placementId?: string
  ) => Promise<AdsgramAssignmentResponse>;
  confirmAssignment: (
    assignmentId: string
  ) => Promise<AdsgramAssignmentResponse>;
  startAdFlow: (placementId?: string) => Promise<AdsgramAssignmentResponse>;
  reset: () => void;
};

type AdsgramSdkPayload = {
  placementId?: string | null;
  userId?: string;
  payload?: unknown;
};

type AdsgramSdk = {
  showRewarded?: (payload: AdsgramSdkPayload) => Promise<unknown> | unknown;
  showFullscreen?: (payload: AdsgramSdkPayload) => Promise<unknown> | unknown;
};

declare global {
  interface Window {
    Adsgram?: AdsgramSdk;
  }
}

const parseApiErrorMessage = (error: ApiError): string => {
  try {
    const parsed = JSON.parse(error.message) as { detail?: unknown };
    if (typeof parsed.detail === "string" && parsed.detail.trim().length > 0) {
      return parsed.detail;
    }
  } catch (err) {
    console.warn("[useAdsgramAd] failed to parse ApiError message", err);
  }

  return error.message || `Adsgram API error (${error.status})`;
};

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return parseApiErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка";
};

const maybeInvokeSdk = async (assignment: AdsgramAssignmentResponse) => {
  if (typeof window === "undefined") {
    return;
  }

  const sdk = window.Adsgram;
  if (!sdk) {
    console.warn("[useAdsgramAd] Adsgram SDK is not available in window scope");
    return;
  }

  const payload: AdsgramSdkPayload = {
    placementId: assignment.placement_id,
    userId: String(assignment.user_id ?? ""),
    payload: assignment.payload?.request ?? assignment.payload,
  };

  if (typeof sdk.showRewarded === "function") {
    await sdk.showRewarded(payload);
    return;
  }

  if (typeof sdk.showFullscreen === "function") {
    await sdk.showFullscreen(payload);
  }
};

const useAdsgramAd = (): AdsgramHookResult => {
  const tokens = useGlobalStore((state) => state.tokens);
  const refreshBalance = useGlobalStore((state) => state.refreshBalance);

  const [status, setStatus] = useState<AdsgramStatus>("idle");
  const [assignment, setAssignment] =
    useState<AdsgramAssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeader = useMemo(() => {
    if (!tokens) return null;
    return {
      Authorization: `Bearer ${tokens.access}`,
    } satisfies Record<string, string>;
  }, [tokens]);

  const requireAuth = useCallback(() => {
    if (!authHeader) {
      throw new Error("Необходимо авторизоваться, чтобы смотреть рекламу.");
    }
  }, [authHeader]);

  const requestAssignment = useCallback<AdsgramHookResult["requestAssignment"]>(
    async (placementId) => {
      try {
        requireAuth();
      } catch (authError) {
        const message = normalizeErrorMessage(authError);
        setError(message);
        setStatus("error");
        throw authError;
      }

      setStatus("requesting");
      setError(null);

      try {
        const response = await request<AdsgramAssignmentResponse>(
          "/adsgram/request/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeader,
            },
            body: JSON.stringify(
              placementId ? { placement_id: placementId } : {}
            ),
          }
        );

        setAssignment(response);
        setStatus("awaiting");
        return response;
      } catch (err) {
        const message = normalizeErrorMessage(err);
        setError(message);
        setStatus("error");
        throw err;
      }
    },
    [authHeader, requireAuth]
  );

  const confirmAssignment = useCallback<AdsgramHookResult["confirmAssignment"]>(
    async (assignmentId) => {
      try {
        requireAuth();
      } catch (authError) {
        const message = normalizeErrorMessage(authError);
        setError(message);
        setStatus("error");
        throw authError;
      }

      setStatus("confirming");

      try {
        const response = await request<AdsgramAssignmentResponse>(
          "/adsgram/complete/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeader,
            },
            body: JSON.stringify({ assignment_id: assignmentId }),
          }
        );

        setAssignment(response);
        setStatus("completed");
        await refreshBalance();
        return response;
      } catch (err) {
        const message = normalizeErrorMessage(err);
        setError(message);
        setStatus("error");
        throw err;
      }
    },
    [authHeader, refreshBalance, requireAuth]
  );

  const startAdFlow = useCallback<AdsgramHookResult["startAdFlow"]>(
    async (placementId) => {
      try {
        const requested = await requestAssignment(placementId);
        await maybeInvokeSdk(requested);
        return await confirmAssignment(requested.assignment_id);
      } catch (err) {
        if (status !== "error") {
          const message = normalizeErrorMessage(err);
          setError(message);
          setStatus("error");
        }
        throw err;
      }
    },
    [confirmAssignment, requestAssignment, status]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setAssignment(null);
    setError(null);
  }, []);

  const isLoading =
    status === "requesting" || status === "awaiting" || status === "confirming";

  return {
    status,
    assignment,
    error,
    isLoading,
    requestAssignment,
    confirmAssignment,
    startAdFlow,
    reset,
  };
};

export default useAdsgramAd;
