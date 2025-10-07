import { create } from "zustand";

type UserData = {
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type GlobalState = {
  userData: UserData | null;
  setUserFromInitData: (initData: any) => void;
};

const useGlobal = create<GlobalState>((set) => ({
  userData: null,

  // Устанавливаем пользователя из initData Telegram WebApp
  setUserFromInitData: (initData) => {
    if (!initData?.user) return;

    const tgUser = initData.user;
    set({
      userData: {
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
        username: tgUser.username || "",
        photo_url: tgUser.photo_url || "",
      },
    });
  },
}));

export default useGlobal;
