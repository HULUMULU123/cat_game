import { BrowserRouter, useLocation } from "react-router-dom";
import { Fragment, useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import RouteLoadingGate from "./components/RouteLoadingGate";
import AppLoader from "./components/AppLoader";
import useGlobalStore from "../shared/store/useGlobalStore";
import useTelegramInit from "./hooks/useTelegramInit";

const AppContent = () => {
  const { pathname } = useLocation();
  const isLoading = useGlobalStore((state) => state.isLoading);
  const tokens = useGlobalStore((state) => state.tokens);
  const loadProfile = useGlobalStore((state) => state.loadProfile);

  useTelegramInit();

  useEffect(() => {
    if (tokens) {
      void loadProfile();
    }
  }, [tokens, loadProfile]);

  const isFailurePage = pathname.includes("failure");

  return (
    <Fragment>
      <AppLoader isVisible={isLoading && !isFailurePage} />
      <RouteLoadingGate />
      <AppRoutes />
    </Fragment>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
