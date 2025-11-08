import { create } from "zustand";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type AuthTokens = {
  access: string;
  refresh: string;
};

export type TelegramUser = {
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
  tokens: AuthTokens | null;
  hasHydratedProfile: boolean;

  setUserFromInitData: (initData: string | undefined | null) => Promise<void>;
  loadProfile: () => Promise<void>;

  /** Обновить баланс без запроса (когда бэк уже вернул новое значение). */
  updateBalance: (balance: number) => void;

  /** Подтянуть баланс запросом (например, после начислений на бэке). */
  refreshBalance: () => Promise<void>;

  submitReferralCode: (code: string) => Promise<{ detail: string }>;

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

const getJson = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error((await response.text()) || `GET ${path} failed`);
  return (await response.json()) as T;
};

const postJsonAuthorized = async <T>(
  path: string,
  token: string,
  body: unknown,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error((await response.text()) || `POST ${path} failed`);
  return (await response.json()) as T;
};

const sanitizePhotoUrl = (url: unknown): string => {
  if (typeof url !== "string") return "";
  return url.replaceAll("\\/", "/");
};

const parseTelegramUser = (initData: string): TelegramUser | null => {
  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");
  if (!rawUser) return null;

  try {
    const decoded = decodeURIComponent(rawUser);
    const parsed = JSON.parse(decoded) as Partial<TelegramUser>;
    return {
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

/* ---------------- store ---------------- */

const useGlobalStore = create<GlobalState>((set, get) => {
  const applyProfileResponse = (payload: ProfileResponse) => {
    set((state) => ({
      userData: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        username: payload.username,
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
    tokens: null,
    hasHydratedProfile: false,

    isLoading: true,
    startLoading: () => set({ isLoading: true }),
    stopLoading: () => set({ isLoading: false }),

    isBottomNavVisible: true,
    setBottomNavVisible: (visible) => set({ isBottomNavVisible: visible }),

    updateBalance: (balance) => {
      console.log("[store] updateBalance:", balance);
      set({ balance });
    },

    refreshBalance: async () => {
      const { tokens } = get();
      if (!tokens) {
        console.warn("[store] refreshBalance: no tokens");
        return;
      }
      try {
        console.log("[store] GET /auth/me/ (refreshBalance)");
        const data = await getJson<ProfileResponse>("/auth/me/", tokens.access);
        applyProfileResponse(data);
        console.log("[store] balance refreshed:", data.balance);
      } catch (err) {
        console.error("[store] refreshBalance failed:", err);
      }
    },

    submitReferralCode: async (code) => {
      const trimmed = code.trim();
      if (!trimmed) {
        throw new Error("Введите реферальный код");
      }

      const { tokens } = get();
      if (!tokens) {
        throw new Error("Не удалось подтвердить профиль пользователя");
      }

      try {
        const response = await postJsonAuthorized<ProfileResponse>(
          "/auth/referral/",
          tokens.access,
          { code: trimmed },
        );

        applyProfileResponse(response);
        return { detail: "Реферальный код успешно активирован" };
      } catch (error) {
        if (error instanceof Error) {
          try {
            const parsed = JSON.parse(error.message) as { detail?: string };
            if (parsed?.detail) {
              throw new Error(parsed.detail);
            }
          } catch {
            // игнорируем ошибки парсинга — пробрасываем исходную
          }
        }
        throw error;
      }
    },

    setUserFromInitData: async (initData) => {
      if (!initData) return;

      const user = parseTelegramUser(initData);
      if (!user) return;

      const usernameForBackend =
        user.username?.trim() || user.first_name?.trim() || "-";

      // сохраним локально — пригодится даже без бэкенда
      set({
        userData: {
          ...user,
          username: usernameForBackend,
        },
      });
      if (!user.username) {
        console.warn(
          "[store] setUserFromInitData: no username — fallback to first_name",
        );
      }

      try {
        console.log("[store] POST /auth/telegram/");
        const data = await postJson<{
          access: string;
          refresh: string;
          user: ProfileResponse;
        }>("/auth/telegram/", {
          username: usernameForBackend,
          first_name: user.first_name,
          last_name: user.last_name,
        });

        set({
          tokens: { access: data.access, refresh: data.refresh },
        });
        applyProfileResponse(data.user);
        set((state) => ({
          userData: {
            ...state.userData,
            photo_url: user.photo_url,
          },
        }));

        console.log("[store] telegram auth ok; balance:", data.user.balance);
      } catch (err) {
        console.error("Failed to authorize with backend", err);
        // оставим локальные userData, но без токенов
      }
    },

    loadProfile: async () => {
      const { tokens, hasHydratedProfile } = get();
      if (!tokens || hasHydratedProfile) return;

      try {
        console.log("[store] GET /auth/me/ (loadProfile)");
        const data = await getJson<ProfileResponse>("/auth/me/", tokens.access);
        applyProfileResponse(data);

        console.log("[store] profile loaded; balance:", data.balance);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    },
  };
});

export default useGlobalStore;
