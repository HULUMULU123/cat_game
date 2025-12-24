import { BrowserRouter, useLocation } from "react-router-dom";
import { Fragment, useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";
import RouteLoadingGate from "./components/RouteLoadingGate";
import AppLoader from "./components/AppLoader";
import LegalBlockScreen from "./components/LegalBlockScreen";
import useGlobalStore from "../shared/store/useGlobalStore";
import useTelegramInit from "./hooks/useTelegramInit";

const AppContent = () => {
  const { pathname } = useLocation();
  const isLoading = useGlobalStore((state) => state.isLoading);
  const legalAccepted = useGlobalStore((state) => state.legalAccepted);
  const legalCheckPending = useGlobalStore((state) => state.legalCheckPending);

  useTelegramInit();

  const tokens = useGlobalStore((state) => state.tokens);
  const loadProfile = useGlobalStore((state) => state.loadProfile);
  const fetchAdsgramBlock = useGlobalStore((state) => state.fetchAdsgramBlock);

  useEffect(() => {
    if (tokens) {
      console.log('----------------')
      void loadProfile();
      console.log('================')
      void fetchAdsgramBlock();
      console.log('=================')
    }
  }, [tokens, loadProfile, fetchAdsgramBlock]);

  const isFailurePage = pathname.includes("failure");
  const shouldBlockForLegal = Boolean(tokens) && legalAccepted === false;

  if (tokens && legalCheckPending) {
    return <AppLoader isVisible />;
  }

  if (shouldBlockForLegal) {
    return <LegalBlockScreen />;
  }

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
