import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import Header from "../../common/Header";
import ModalName from "../../common/ModalName";
import RewardsSection from "./RewardsSection";
import SpecialRewards from "./SpecialRewards";
import TodayDate from "./TodayDate";
import { request } from "../../../../shared/api/httpClient";
import type {
  DailyRewardClaimResponse,
  DailyRewardConfigResponse,
} from "../../../../shared/api/types";
import useGlobalStore from "../../../../shared/store/useGlobalStore";

const StyledWrapper = styled.div`
  width: 100%;
`;

interface RewardModalProps {
  handleClose: () => void;
}

export default function RewardModal({ handleClose }: RewardModalProps) {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);

  const [config, setConfig] = useState<DailyRewardConfigResponse | null>(null);
  const [claimResult, setClaimResult] =
    useState<DailyRewardClaimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tokens) return;
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const data = await request<DailyRewardConfigResponse>("/daily-rewards/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (!mounted) return;
        setConfig(data);
        setError(null);
      } catch (err) {
        console.error("[DailyRewardModal] load error", err);
        if (!mounted) return;
        setConfig(null);
        setError("Не удалось загрузить ежедневные награды");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tokens]);

  useEffect(() => {
    if (!tokens || !config || config.today_claimed || claimResult) return;

    let cancelled = false;

    (async () => {
      try {
        const resp = await request<DailyRewardClaimResponse>(
          "/daily-rewards/claim/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (cancelled) return;
        setClaimResult(resp);
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                today_claimed: true,
                streak: resp.streak,
                next_day: resp.next_day,
                current_day: resp.current_day,
                last_claim_date: resp.claim.claimed_for_date,
              }
            : prev
        );
        updateBalance(resp.balance);
      } catch (err) {
        console.error("[DailyRewardModal] claim error", err);
        if (!cancelled) setError("Не удалось получить ежедневную награду");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokens, config, claimResult, updateBalance]);

  const rewards = config?.rewards ?? [];
  const nextDay = claimResult?.next_day ?? config?.next_day ?? 1;
  const currentDay = claimResult?.current_day ?? config?.current_day ?? 0;
  const claimedCount = (() => {
    if (!config) return 0;
    if (currentDay >= 8 && nextDay === 1) return 0;
    return Math.min(currentDay, 7);
  })();
  const specialReward = rewards.find((item) => item.day_number === 8) ?? null;
  const specialStatus: "claimed" | "next" | "locked" = currentDay >= 8
    ? "claimed"
    : nextDay === 8
    ? "next"
    : "locked";
  const lastClaimDate =
    claimResult?.claim.claimed_for_date ?? config?.last_claim_date ?? null;
  const currentDate = useMemo(
    () => new Date(now).toLocaleDateString("ru-RU"),
    [now]
  );
  const nextUpdateHint = useMemo(() => {
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const diff = Math.max(nextMidnight.getTime() - now, 0);
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const mm = minutes.toString().padStart(2, "0");
    return `До обновления награды: ${hours} ч ${mm} м`;
  }, [now]);

  return (
    <StyledWrapper>
      <Header infoType="reward" handleClose={handleClose} />
      <ModalName textName="ЕЖЕДНЕВНАЯ НАГРАДА" />
      <RewardsSection
        rewards={rewards}
        claimedCount={claimedCount}
        nextDay={nextDay}
        loading={loading}
        error={error}
        nextUpdateHint={nextUpdateHint}
      />
      <SpecialRewards
        rewardAmount={specialReward?.reward_amount ?? null}
        status={specialStatus}
        lastClaimDate={lastClaimDate}
      />
      <TodayDate currentDate={currentDate} currentDay={currentDay} totalDays={8} />
    </StyledWrapper>
  );
}
