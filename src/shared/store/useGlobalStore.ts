import { create } from "zustand";

export type TelegramUser = {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

interface GlobalState {
  userData: TelegramUser | null;
  setUserFromInitData: (initData: string | undefined | null) => void;
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

export const useGlobalStore = create<GlobalState>((set) => ({
  userData: null,
  setUserFromInitData: (initData) => {
    if (!initData) {
      return;
    }

    const user = parseTelegramUser(initData);
    if (user) {
      set({ userData: user });
    }
  },
  isLoading: true,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));

export default useGlobalStore;
