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
  setUserFromInitData: (initData: string) => {
  if (!initData) return;
    console.log(initData, 'initdata from function')
  // Разбираем query string
  const params = new URLSearchParams(initData);
  const userString = params.get("user");
    console.log(userString)
  if (!userString) return;

  try {
    const tgUser = JSON.parse(decodeURIComponent(userString));
    set({
      userData: {
        first_name: tgUser.first_name || "",
        last_name: tgUser.last_name || "",
        username: tgUser.username || "",
        photo_url: tgUser.photo_url || "",
      },
    });
  } catch (e) {
    console.error("Ошибка парсинга user из initData:", e);
  }
}
}));

export default useGlobal;
