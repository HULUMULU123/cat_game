import { useQuery } from "react-query";

import { request } from "../api/httpClient";
import type { AdsgramBlockResponse } from "../api/types";
import useGlobalStore from "../store/useGlobalStore";

const useAdsgramBlock = () => {
  const tokens = useGlobalStore((state) => state.tokens);

  return useQuery<AdsgramBlockResponse>({
    queryKey: ["adsgram-block", tokens?.access ?? null],
    enabled: Boolean(tokens),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!tokens) {
        throw new Error("missing tokens");
      }

      return request<AdsgramBlockResponse>("adsgram/block/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
  });
};

export default useAdsgramBlock;
