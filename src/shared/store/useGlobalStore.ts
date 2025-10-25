import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

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

interface GlobalState {
  userData: TelegramUser | null;
  balance: number;
  tokens: AuthTokens | null;
  hasHydratedProfile: boolean;
  setUserFromInitData: (initData: string | undefined | null) => Promise<void>;
  loadProfile: () => Promise<void>;
  updateBalance: (balance: number) => void;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const sanitizePhotoUrl = (url: unknown): string => {
  if (typeof url !== "string") {
    return "";
  }

  return url.replaceAll("\\/", "/");
};

const parseTelegramUser = (initData: string): TelegramUser | null => {
  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");

  if (!rawUser) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(rawUser);
    const parsed = JSON.parse(decoded) as Partial<TelegramUser> & {
      first_name?: string;
      photo_url?: string;
    };

    return {
      first_name: parsed.first_name ?? "",
      last_name: parsed.last_name ?? "",
      username: parsed.username ?? "",
      photo_url: sanitizePhotoUrl(parsed.photo_url),
    };
  } catch (error) {
    console.error("Failed to parse Telegram init data", error);
    return null;
  }
};

const postJson = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request to ${path} failed`);
  }

  return (await response.json()) as T;
};

const getJson = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request to ${path} failed`);
  }

  return (await response.json()) as T;
};

export const useGlobalStore = create<GlobalState>((set, get) => ({
  userData: null,
  balance: 0,
  tokens: null,
  hasHydratedProfile: false,
  setUserFromInitData: async (initData) => {
    if (!initData) {
      return;
    }

    const user = parseTelegramUser(initData);
    if (!user) {
      return;
    }

    set({ userData: user });

    if (!user.username) {
      return;
    }

    try {
      const data = await postJson<{
        access: string;
        refresh: string;
        user: { username: string; first_name: string; last_name: string; balance: number };
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
    } catch (error) {
      console.error("Failed to authorize with backend", error);
    }
  },
  loadProfile: async () => {
    const { tokens, hasHydratedProfile } = get();
    if (!tokens || hasHydratedProfile) {
      return;
    }

    try {
      const data = await getJson<{
        username: string;
        first_name: string;
        last_name: string;
        balance: number;
      }>("/auth/me/", tokens.access);

      set({
        userData: {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
        },
        balance: data.balance,
        hasHydratedProfile: true,
      });
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  },
  updateBalance: (balance) => set({ balance }),
  isLoading: true,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));

export default useGlobalStore;
