// App.tsx
import { Suspense, lazy, useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import styled from "styled-components";
import useGlobal from "./hooks/useGlobal";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Simulation = lazy(() => import("./pages/Simulation"));
const Prize = lazy(() => import("./pages/Prize"));
const Failure = lazy(() => import("./pages/Failure"));

import StakanLoader from "./components/loader/StakanLoader";
import wordmark from "./assets/coin1.png";

/* ---------- верхний слой оверлея ---------- */
const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.35s ease;
`;

/* ---------- утилита: дождаться картинок внутри страницы ---------- */
function waitImages(container: HTMLElement, timeout = 2000) {
  const imgs = Array.from(container.querySelectorAll("img")).filter(
    (i) => !i.complete
  ) as HTMLImageElement[];
  if (imgs.length === 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let done = false;
    const onDone = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const timer = setTimeout(onDone, timeout);
    let left = imgs.length;
    imgs.forEach((img) => {
      const fin = () => {
        if (--left <= 0) {
          clearTimeout(timer);
          onDone();
        }
      };
      img.addEventListener("load", fin, { once: true });
      img.addEventListener("error", fin, { once: true });
    });
  });
}

/* ---------- компонент: гасим лоадер после рендера страницы ---------- */
function PageReady({ children }: { children: React.ReactNode }) {
  const stopLoading = useGlobal((s) => s.stopLoading);

  useEffect(() => {
    let alive = true;
    // ждём кадр отрисовки + загрузку картинок в пределах текущего роут-контейнера
    const run = async () => {
      // сначала дождаться следующего animation frame (2 раза — для надёжности)
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      // затем дождаться загрузки картинок в корневом контейнере роутера
      const root = document.getElementById("root") || document.body;
      await waitImages(root, 2000);
      if (alive) stopLoading();
    };
    run();
    return () => {
      alive = false;
    };
  }, [stopLoading]);

  return <>{children}</>;
}

/* ---------- включает лоадер при смене маршрута ---------- */
function RouteLoadingGate() {
  const location = useLocation();
  const startLoading = useGlobal((s) => s.startLoading);
  useEffect(() => {
    startLoading();
  }, [location.pathname, startLoading]);
  return null;
}

/* ---------- основное приложение ---------- */
function AppInner() {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobal((s) => s.setUserFromInitData);
  const { isLoading, stopLoading, startLoading } = useGlobal();

  // первичная инициализация TG WebApp
  useEffect(() => {
    if (!webApp) return;
    startLoading(); // на самый первый рендер тоже включим
    webApp.ready();
    setUserFromInitData(webApp.initData);
    webApp.disableVerticalSwipes?.();
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // гасим первичную загрузку после первого реального кадра
    let alive = true;
    const afterFirstPaint = async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (alive) stopLoading();
    };
    afterFirstPaint();

    return () => {
      alive = false;
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [webApp, setUserFromInitData, startLoading, stopLoading]);

  return (
    <>
      {/* Глобальный лоадер поверх всего */}
      {createPortal(
        <LoaderTopLayer $visible={isLoading}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Гружу страницу…"
            stopAt={96}
            totalDuration={3000}
          />
        </LoaderTopLayer>,
        document.body
      )}

      <RouteLoadingGate />
      <Suspense
        fallback={
          // локальный фоллбек — на случай ленивых чанков; глобальный оверлей всё равно выше
          <StakanLoader wordmarkSrc={wordmark} subtitle="Гружу модуль…" stopAt={90} />
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <PageReady>
                  <Home />
                </PageReady>
              }
            />
            <Route
              path="tasks/"
              element={
                <PageReady>
                  <Tasks />
                </PageReady>
              }
            />
            <Route
              path="quiz/"
              element={
                <PageReady>
                  <Quiz />
                </PageReady>
              }
            />
            <Route
              path="simulation/"
              element={
                <PageReady>
                  <Simulation />
                </PageReady>
              }
            />
            <Route
              path="prize/"
              element={
                <PageReady>
                  <Prize />
                </PageReady>
              }
            />
            <Route
              path="failure/"
              element={
                <PageReady>
                  <Failure />
                </PageReady>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
