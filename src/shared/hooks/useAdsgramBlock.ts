import { useEffect } from "react";
import useGlobalStore from "../store/useGlobalStore";

const useAdsgramBlock = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const adsgramBlockId = useGlobalStore((state) => state.adsgramBlockId);
  const fetchAdsgramBlock = useGlobalStore((state) => state.fetchAdsgramBlock);

  useEffect(() => {
    if (!tokens || adsgramBlockId) return;

    void fetchAdsgramBlock();
  }, [tokens, adsgramBlockId, fetchAdsgramBlock]);

  return { blockId: adsgramBlockId };
};

export default useAdsgramBlock;
