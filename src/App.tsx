import { Suspense, lazy, useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import useGlobal from "./hooks/useGlobal";
import Layout from "./components/Layout";

// ленивые страницы (чтобы показывать лоадер пока грузятся чанки)
const Home = lazy(() => import("./pages/Home"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Simulation = lazy(() => import("./pages/Simulation"));
const Prize = lazy(() => import("./pages/Prize"));
const Failure = lazy(() => import("./pages/Failure"));

// ваш лоадер на styled-components
import StakanLoader from "./components/loader/StakanLoader";
import wordmark from "./assets/coin1.png"

// маленький хелпер — включает лоадер при смене пути
function RouteLoadingGate() {
  const location = useLocation();
  const startLoading = useGlobal((s) => s.startLoading);

  useEffect(() => {
    startLoading(); // включаем перед монтажом новой страницы
  }, [location.pathname, startLoading]);

  return null;
}

function AppInner() {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobal((s) => s.setUserFromInitData);
  const { isLoading, stopLoading } = useGlobal();

  // Инициализация Telegram WebApp + выключаем первичный лоадер
  useEffect(() => {
    if (!webApp) return;

    webApp.ready();
    setUserFromInitData(webApp.initData);

    if (webApp.disableVerticalSwipes) {
      webApp.disableVerticalSwipes();
    }

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // даём кадр на отрисовку — и гасим лоадер
    const t = setTimeout(() => stopLoading(), 300);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [webApp, setUserFromInitData, stopLoading]);

  return (
    <>
      {isLoading && (
        <StakanLoader
          wordmarkSrc={wordmark}
          subtitle="Грею лапки на клавиатуре…"
        />
      )}

      <RouteLoadingGate />
      <Suspense fallback={<StakanLoader wordmarkSrc={wordmark} subtitle="Гружу страницу…" />}>
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

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
