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

type ProfileResponse = {
  username: string;
  first_name: string;
  last_name: string;
  balance: number;
};

interface GlobalState {
  userData: TelegramUser | null;

  balance: number;
  tokens: AuthTokens | null;
  hasHydratedProfile: boolean;

  setUserFromInitData: (initData: string | undefined | null) => Promise<void>;
  loadProfile: () => Promise<void>;

  /** Обновить баланс без запроса (когда бэк уже вернул новое значение). */
  updateBalance: (balance: number) => void;

  /** Подтянуть баланс запросом (например, после начислений на бэке). */
  refreshBalance: () => Promise<void>;

  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
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

const useGlobalStore = create<GlobalState>((set, get) => ({
  userData: null,
  balance: 0,
  tokens: null,
  hasHydratedProfile: false,

  isLoading: true,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),

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
      set({ balance: data.balance });
      console.log("[store] balance refreshed:", data.balance);
    } catch (err) {
      console.error("[store] refreshBalance failed:", err);
    }
  },

  setUserFromInitData: async (initData) => {
    if (!initData) return;

    const user = parseTelegramUser(initData);
    if (!user) return;

    // сохраним локально — пригодится даже без бэкенда
    set({ userData: user });

    if (!user.username) {
      console.warn(
        "[store] setUserFromInitData: no username — skip backend auth"
      );
      return;
    }

    try {
      console.log("[store] POST /auth/telegram/");
      const data = await postJson<{
        access: string;
        refresh: string;
        user: {
          username: string;
          first_name: string;
          last_name: string;
          balance: number;
        };
      }>("/auth/telegram/", {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });

      set({
        userData: {
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          username: data.user.username,
          photo_url: user.photo_url,
        },
        tokens: { access: data.access, refresh: data.refresh },
        balance: data.user.balance,
        hasHydratedProfile: true,
      });

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

      set({
        userData: {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
        },
        balance: data.balance,
        hasHydratedProfile: true,
      });

      console.log("[store] profile loaded; balance:", data.balance);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  },
}));

export default useGlobalStore;
