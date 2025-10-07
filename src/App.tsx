import { useEffect } from "react";
import { useWebApp } from "@vkruglikov/react-telegram-web-app";
import Header from "./components/home/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Tasks from "./pages/Tasks";
import Quiz from "./pages/Quiz";
import Simulation from "./pages/Simulation";
import Prize from "./pages/Prize";
import Failure from "./pages/Failure";
import useGlobal from "./hooks/useGlobal";

function App() {
  const webApp = useWebApp();
  const setUserFromInitData = useGlobal((state) => state.setUserFromInitData);
  useEffect(() => {
    console.log(webApp, 'testWebapp')
  if (!webApp) return; // WebApp пока не готов

  webApp.ready(); // говорим Telegram, что приложение готово

  // после ready можно безопасно использовать initData
  console.log("initData:", webApp.initData);
    setUserFromInitData(webApp.initData)
  if (webApp.disableVerticalSwipes) {
    webApp.disableVerticalSwipes();
  }

  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";

  return () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };
  }, [webApp]);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
