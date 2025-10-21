import { Suspense, lazy, useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import styled from "styled-components";

import useGlobal from "./hooks/useGlobal";
import Layout from "./components/Layout";

// ленивые страницы
const Home = lazy(() => import("./pages/Home"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Simulation = lazy(() => import("./pages/Simulation"));
const Prize = lazy(() => import("./pages/Prize"));
const Failure = lazy(() => import("./pages/Failure"));

// загрузочный экран
import StakanLoader from "./components/loader/StakanLoader";
import wordmark from "./assets/coin1.png";

/* --------------------------- Стили для верхнего слоя --------------------------- */
const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647; /* поверх всего */
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.4s ease;
`;

/* --------------------------- Триггер загрузки при смене маршрута --------------------------- */
function RouteLoadingGate() {
  const location = useLocation();
  const startLoading = useGlobal((s) => s.startLoading);

  useEffect(() => {
    startLoading(); // включаем лоадер при смене страницы
  }, [location.pathname, startLoading]);

  return null;
}

/* --------------------------- Основное приложение --------------------------- */
function AppInner() {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobal((s) => s.setUserFromInitData);
  const { isLoading, stopLoading } = useGlobal();

  useEffect(() => {
    if (!webApp) return;

    webApp.ready();
    setUserFromInitData(webApp.initData);
    webApp.disableVerticalSwipes?.();

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // задержка перед отключением лоадера, чтобы дать всё дорисовать
    const t = setTimeout(() => stopLoading(), 500);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [webApp, setUserFromInitData, stopLoading]);

  return (
    <>
      {/* --- Глобальный загрузчик поверх всего через портал --- */}
      {createPortal(
        <LoaderTopLayer $visible={isLoading}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Грею лапки на клавиатуре…"
            totalDuration={3000}
            stopAt={97}
          />
        </LoaderTopLayer>,
        document.body
      )}

      {/* --- Контент приложения --- */}
      <RouteLoadingGate />
      <Suspense
        fallback={
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Гружу страницу…"
            totalDuration={2500}
            stopAt={90}
          />
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tasks/" element={<Tasks />} />
            <Route path="quiz/" element={<Quiz />} />
            <Route path="simulation/" element={<Simulation />} />
            <Route path="prize/" element={<Prize />} />
            <Route path="failure/" element={<Failure />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

/* --------------------------- Экспорт с роутером --------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
