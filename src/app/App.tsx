import { BrowserRouter, useLocation } from "react-router-dom";
import { Fragment } from "react";
import AppRoutes from "./routes/AppRoutes";
import RouteLoadingGate from "./components/RouteLoadingGate";
import AppLoader from "./components/AppLoader";
import useGlobalStore from "../shared/store/useGlobalStore";
import useTelegramInit from "./hooks/useTelegramInit";

const AppContent = () => {
  const { pathname } = useLocation();
  const isLoading = useGlobalStore((state) => state.isLoading);

  useTelegramInit();

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
