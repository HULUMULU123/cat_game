// store/global.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdsgramBlockResponse } from "../api/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

/* ---------------- types ---------------- */

type AuthTokens = {
  access: string;
  refresh: string;
};

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type ProfileStatsResponse = {
  failures_completed: number;
  quizzes_completed: number;
  tasks_completed: number;
};

type ProfileResponse = {
  username: string;
  first_name: string;
  last_name: string;
  balance: number;
  referral_code: string;
  referred_by_code: string | null;
  referrals_count: number;
  stats: ProfileStatsResponse;
};

type ProfileStatsState = {
  failuresCompleted: number;
  quizzesCompleted: number;
  tasksCompleted: number;
};

interface GlobalState {
  userData: TelegramUser | null;

  balance: number;
  referralCode: string | null;
  referredByCode: string | null;
  referralsCount: number;
  profileStats: ProfileStatsState;
  completedFailures: Record<number, boolean>;
  tokens: AuthTokens | null;
  adsgramBlockId: string | null;
  hasHydratedProfile: boolean;

  setUserFromInitData: (initData: string | undefined | null) => Promise<void>;
  loadProfile: () => Promise<void>;

  updateBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  submitReferralCode: (code: string) => Promise<{ detail: string }>;
  redeemPromoCode: (code: string) => Promise<{ detail: string }>;

  setTokens: (t: AuthTokens | null) => void;
  logout: () => void;

  fetchAdsgramBlock: () => Promise<void>;

  markFailureCompleted: (failureId: number) => void;

  incrementProfileStat: (stat: "failures" | "quizzes" | "tasks") => void;

  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;

  isBottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;
}

/* ---------------- helpers ---------------- */

const postJson = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error((await response.text()) || `POST ${path} failed`);
  return (await response.json()) as T;
};

const sanitizePhotoUrl = (url: unknown): string =>
  typeof url === "string" ? url.split("\\/").join("/") : "";

const parseTelegramUser = (initData: string): TelegramUser | null => {
  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");
  if (!rawUser) return null;

  try {
    const decoded = decodeURIComponent(rawUser);
    const parsed = JSON.parse(decoded) as Partial<TelegramUser> & {
      id?: number | string;
    };
    const rawId = parsed.id;
    const numericId =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string"
        ? Number.parseInt(rawId, 10)
        : NaN;
    const safeId = Number.isFinite(numericId) ? numericId : 0;
    return {
      id: safeId,
      first_name: parsed.first_name ?? "",
      last_name: parsed.last_name ?? "",
      username: parsed.username ?? "",
      photo_url: sanitizePhotoUrl(parsed.photo_url),
    };
  } catch (e) {
    console.error("Failed to parse Telegram init data", e);
    return null;
  }
};

const buildBackendUsername = (user: TelegramUser): string => {
  const trimmed = user.username?.trim();
  if (trimmed) return trimmed.slice(0, 50);

  const displayName = "user";
  const normalized = displayName;

  const base = normalized;
  const truncatedBase = base.slice(0, 100);
  console.log(truncatedBase);
  return `${truncatedBase}_${user.id}`.slice(0, 150);
};

/* ---- unified authed fetch with refresh ---- */

async function authFetch(
  path: string,
  init: RequestInit,
  get: () => GlobalState,
  set: (p: Partial<GlobalState>) => void
) {
  const { tokens } = get();
  const withAuth: RequestInit = {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(tokens ? { Authorization: `Bearer ${tokens.access}` } : {}),
    },
  };

  let res = await fetch(`${API_BASE_URL}${path}`, withAuth);

  if (res.status === 401 && tokens?.refresh) {
    try {
      const r = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = (await r.json()) as { access: string };
      const next = { access: data.access, refresh: tokens.refresh };
      set({ tokens: next });

      res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          ...(init.headers || {}),
          Authorization: `Bearer ${next.access}`,
        },
      });
    } catch {
      set({ tokens: null, hasHydratedProfile: false });
      throw new Error("Сессия истекла. Войдите снова.");
    }
  }

  if (!res.ok)
    throw new Error(
      (await res.text()) || `${init.method || "GET"} ${path} failed`
    );
  return res;
}

async function authGetJson<T>(
  path: string,
  get: () => GlobalState,
  set: (p: Partial<GlobalState>) => void
): Promise<T> {
  const res = await authFetch(path, {}, get, set);
  return (await res.json()) as T;
}

async function authPostJson<T>(
  path: string,
  body: unknown,
  get: () => GlobalState,
  set: (p: Partial<GlobalState>) => void
): Promise<T> {
  const res = await authFetch(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    get,
    set
  );
  return (await res.json()) as T;
}

/* ---------------- store ---------------- */

let loadProfilePromise: Promise<void> | null = null;
let adsgramBlockPromise: Promise<void> | null = null;

const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => {
      const applyProfileResponse = (payload: ProfileResponse) => {
        set((state) => ({
          userData: {
            id: state.userData?.id ?? 0,
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: state.userData?.username ?? payload.username,
            photo_url: state.userData?.photo_url ?? "",
          },
          balance: payload.balance,
          referralCode: payload.referral_code,
          referredByCode: payload.referred_by_code,
          referralsCount: payload.referrals_count,
          profileStats: {
            failuresCompleted: payload.stats?.failures_completed ?? 0,
            quizzesCompleted: payload.stats?.quizzes_completed ?? 0,
            tasksCompleted: payload.stats?.tasks_completed ?? 0,
          },
          hasHydratedProfile: true,
        }));
      };

      return {
        userData: null,
        balance: 0,
        referralCode: null,
        referredByCode: null,
        referralsCount: 0,
        profileStats: {
          failuresCompleted: 0,
          quizzesCompleted: 0,
          tasksCompleted: 0,
        },
        completedFailures: {},
        tokens: null,
        adsgramBlockId: null,
        hasHydratedProfile: false,

        isLoading: true,
        startLoading: () => set({ isLoading: true }),
        stopLoading: () => set({ isLoading: false }),

        isBottomNavVisible: true,
        setBottomNavVisible: (visible) => set({ isBottomNavVisible: visible }),

        updateBalance: (balance) => set({ balance }),

        markFailureCompleted: (failureId) =>
          set((state) => ({
            completedFailures: {
              ...state.completedFailures,
              [failureId]: true,
            },
          })),

        incrementProfileStat: (stat) =>
          set((state) => {
            const keyMap = {
              failures: "failuresCompleted",
              quizzes: "quizzesCompleted",
              tasks: "tasksCompleted",
            } as const;

            const key = keyMap[stat];
            const current = state.profileStats[key] ?? 0;

            return {
              profileStats: {
                ...state.profileStats,
                [key]: current + 1,
              },
            };
          }),

        refreshBalance: async () => {
          const { tokens } = get();
          if (!tokens) return;
          try {
            const data = await authGetJson<ProfileResponse>(
              "/auth/me/",
              get,
              set
            );
            applyProfileResponse(data);
          } catch (err) {
            console.error("[store] refreshBalance failed:", err);
          }
        },

        submitReferralCode: async (code) => {
          const trimmed = code.trim();
          if (!trimmed) throw new Error("Введите реферальный код");

          const { tokens } = get();
          if (!tokens)
            throw new Error("Не удалось подтвердить профиль пользователя");

          try {
            const response = await authPostJson<ProfileResponse>(
              "/auth/referral/",
              { code: trimmed },
              get,
              set
            );

            applyProfileResponse(response);
            return { detail: "Реферальный код успешно активирован" };
          } catch (error) {
            if (error instanceof Error) {
              try {
                const parsed = JSON.parse(error.message) as { detail?: string };
                if (parsed?.detail) throw new Error(parsed.detail);
              } catch {}
            }
            throw error;
          }
        },

        redeemPromoCode: async (code) => {
          const trimmed = code.trim();
          if (!trimmed) throw new Error("Введите промокод");

          const { tokens } = get();
          if (!tokens)
            throw new Error("Не удалось подтвердить профиль пользователя");

          try {
            const response = await authPostJson<ProfileResponse>(
              "/auth/promo/",
              { code: trimmed },
              get,
              set
            );

            applyProfileResponse(response);
            return { detail: "Промокод успешно активирован" };
          } catch (error) {
            if (error instanceof Error) {
              try {
                const parsed = JSON.parse(error.message) as { detail?: string };
                if (parsed?.detail) throw new Error(parsed.detail);
              } catch {}
            }
            throw error;
          }
        },

        setUserFromInitData: async (initData) => {
          if (!initData) return;

          const user = parseTelegramUser(initData);
          if (!user) return;

          const usernameForBackend = buildBackendUsername(user);
          const displayUsername = user.username?.trim() || "-";

          // предварительно сохраним
          set({
            userData: {
              ...user,
              username: displayUsername,
            },
          });

          try {
            const data = await postJson<{
              access: string;
              refresh: string;
              user: ProfileResponse;
            }>("/auth/telegram/", {
              username: usernameForBackend,
              first_name: user.first_name,
              last_name: user.last_name,
            });

            set({ tokens: { access: data.access, refresh: data.refresh } });
            applyProfileResponse(data.user);
            // подтянем фото от Telegram
            set((state) => ({
              userData: {
                ...state.userData!,
                photo_url: user.photo_url,
              },
            }));
          } catch (err) {
            console.error("Failed to authorize with backend", err);
          }
        },

        loadProfile: async () => {
          const { tokens, hasHydratedProfile } = get();
          if (!tokens || hasHydratedProfile) return;

          if (loadProfilePromise) {
            return loadProfilePromise;
          }

          loadProfilePromise = (async () => {
            try {
              const data = await authGetJson<ProfileResponse>(
                "/auth/me/",
                get,
                set
              );
              applyProfileResponse(data);
            } catch (err) {
              console.error("Failed to load profile", err);
            } finally {
              loadProfilePromise = null;
            }
          })();

          return loadProfilePromise;
        },

        fetchAdsgramBlock: async () => {
          console.log('in block')
          const { tokens } = get();
          if (!tokens) return;

          if (adsgramBlockPromise) {
            return adsgramBlockPromise;
          }

          adsgramBlockPromise = (async () => {
            try {
              const data = await authGetJson<AdsgramBlockResponse>(
                "adsgram/block/",
                get,
                set
              );

              console.log(data)

              set({ adsgramBlockId: data.block_id });
            } catch (err) {
              console.error("Failed to fetch Adsgram block id", err);
              set({ adsgramBlockId: null });
            } finally {
              adsgramBlockPromise = null;
            }
          })();

          return adsgramBlockPromise;
        },

        setTokens: (t) => set({ tokens: t }),
        logout: () =>
          set({
            tokens: null,
            hasHydratedProfile: false,
            balance: 0,
            referralCode: null,
            referredByCode: null,
            referralsCount: 0,
            profileStats: {
              failuresCompleted: 0,
              quizzesCompleted: 0,
              tasksCompleted: 0,
            },
            completedFailures: {},
            adsgramBlockId: null,
          }),
      };
    },
    {
      name: "global-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tokens: s.tokens,
        userData: s.userData,
        balance: s.balance,
        referralCode: s.referralCode,
        referredByCode: s.referredByCode,
        referralsCount: s.referralsCount,
        profileStats: s.profileStats,
        hasHydratedProfile: s.hasHydratedProfile,
        completedFailures: s.completedFailures,
      }),
      version: 1,
    }
  )
);

export default useGlobalStore;
