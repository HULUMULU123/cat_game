// hooks/useGlobal.ts
import { create } from "zustand";

type UserData = {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type GlobalState = {
  userData: UserData | null;
  setUserFromInitData: (initData: string | undefined | null) => void;

  // загрузка
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const useGlobal = create<GlobalState>((set) => ({
  userData: null,

  setUserFromInitData: (initData) => {
    if (!initData) return;

    try {
      const params = new URLSearchParams(initData);
      const userString = params.get("user");
      if (!userString) return;

      const tgUser = JSON.parse(decodeURIComponent(userString));
      set({
        userData: {
          first_name: tgUser.first_name || "",
          last_name: tgUser.last_name || "",
          username: tgUser.username || "",
          photo_url: tgUser.photo_url
            ? String(tgUser.photo_url).replace(/\\\//g, "/")
            : "",
        },
      });
    } catch (e) {
      console.error("Ошибка парсинга user из initData:", e);
    }
  },

  // загрузка по умолчанию включена (покажем лоадер до init)
  isLoading: true,
  startLoading: () => set({ isLoading: true }),
  stopLoading:  () => set({ isLoading: false }),
}));

export default useGlobal;
