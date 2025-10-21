// hooks/usePageReady.ts
import { useEffect } from "react";
import useGlobal from "./useGlobal";

export default function usePageReady(deps: any[] = []) {
  const stopLoading = useGlobal((s) => s.stopLoading);
  useEffect(() => {
    const t = setTimeout(() => stopLoading(), 120); // маленький минимум для плавности
    return () => clearTimeout(t);
  }, deps); // если у страницы есть загрузка данных — передай сюда зависимости
}