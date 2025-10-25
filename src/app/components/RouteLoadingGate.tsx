import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useGlobalStore from "../../shared/store/useGlobalStore";

const ROUTE_LOADING_DELAY = 250;

const RouteLoadingGate = () => {
  const location = useLocation();
  const startLoading = useGlobalStore((state) => state.startLoading);
  const stopLoading = useGlobalStore((state) => state.stopLoading);

  useEffect(() => {
    startLoading();

    const timer = window.setTimeout(() => {
      stopLoading();
    }, ROUTE_LOADING_DELAY);

    return () => window.clearTimeout(timer);
  }, [location.pathname, startLoading, stopLoading]);

  return null;
};

export default RouteLoadingGate;
