import { DependencyList, useEffect } from "react";
import useGlobalStore from "../store/useGlobalStore";

const DEFAULT_DELAY = 120;

const usePageReady = (deps: DependencyList = []): void => {
  const stopLoading = useGlobalStore((state) => state.stopLoading);

  useEffect(() => {
    const timer = window.setTimeout(() => stopLoading(), DEFAULT_DELAY);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default usePageReady;
