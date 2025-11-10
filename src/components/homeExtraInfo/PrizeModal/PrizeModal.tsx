import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Header from "../common/Header";
import SectionInfo from "../../common/SectionInfo";
import PrizeCard from "./PrizeCard";
import PrizeDescription from "./PrizeDescription";
import { request } from "../../../shared/api/httpClient";
import type { FailureResponse } from "../../../shared/api/types";
import useGlobalStore from "../../../shared/store/useGlobalStore";
import { useQuery } from "react-query";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const StyledWrapper = styled.div`
  width: 100%;
`;

const Placeholder = styled.div`
  width: 92%;
  margin: 24px auto;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: var(--color-white-text);
`;

interface PrizeModalProps {
  handleClose: () => void;
}

export default function PrizeModal({ handleClose }: PrizeModalProps) {
  const tokens = useGlobalStore((state) => state.tokens);
  const balance = useGlobalStore((state) => state.balance);
  const refreshBalance = useGlobalStore((state) => state.refreshBalance);
  const completedFailures = useGlobalStore((state) => state.completedFailures);

  const [now, setNow] = useState<number>(() => Date.now());
  const {
    data: failures,
    isLoading,
    isError,
    error,
  } = useQuery<FailureResponse[]>({
    queryKey: ["failures", tokens?.access ?? null, "prize-modal"],
    queryFn: async () => {
      if (!tokens) return [];
      return request<FailureResponse[]>("/failures/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
    enabled: Boolean(tokens),
  });

  useEffect(() => {
    if (isError && error) {
      console.error("[PrizeModal] failure fetch error", error);
    }
  }, [error, isError]);

  const failure = failures?.[0] ?? null;

  useEffect(() => {
    if (!tokens) return;
    void refreshBalance();
  }, [refreshBalance, tokens]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startMs = useMemo(
    () => (failure?.start_time ? new Date(failure.start_time).getTime() : null),
    [failure?.start_time]
  );
  const endMs = useMemo(
    () => (failure?.end_time ? new Date(failure.end_time).getTime() : null),
    [failure?.end_time]
  );

  const isActive = useMemo(() => {
    if (!failure) return false;
    if (startMs !== null && now >= startMs) {
      if (endMs !== null) return now < endMs;
      return true;
    }
    return false;
  }, [endMs, failure, now, startMs]);

  const isUpcoming = useMemo(() => {
    if (!failure) return true;
    if (startMs === null) return true;
    return now < startMs;
  }, [failure, now, startMs]);

  const timerLabel = useMemo(() => {
    if (isActive) return "СБОЙ ЗАКОНЧИТСЯ ЧЕРЕЗ";
    if (isUpcoming) return "СБОЙ СКОРО";
    return "ПОИСК АНОМАЛИЙ";
  }, [isActive, isUpcoming]);

  const timerValue = useMemo(() => {
    const pad = (value: number) => value.toString().padStart(2, "0");

    if (isUpcoming && startMs !== null) {
      const diff = Math.max(startMs - now, 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    }

    if (isUpcoming && startMs === null) {
      return "Поиск аномалий...";
    }

    if (isActive && endMs !== null) {
      const diff = Math.max(endMs - now, 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    }

    if (isActive && endMs === null) {
      return "Идет";
    }

    return "";
  }, [endMs, isActive, isUpcoming, now, startMs]);

  const hasCompletedFailure = useMemo(() => {
    if (!failure) return false;
    if (failure.is_repeatable) return false;
    if (failure.is_completed) return true;
    return Boolean(completedFailures[failure.id]);
  }, [completedFailures, failure]);

  const completionNote = hasCompletedFailure
    ? "Вы уже прошли текущий сбой"
    : null;

  const displayTimerValue = timerValue || "";
  const currentDate = useMemo(
    () => new Date(now).toLocaleDateString("ru-RU"),
    [now]
  );

  const mainPrizeTitle = failure?.main_prize_title ?? null;
  const mainPrizeImage = failure?.main_prize_image ?? null;
  const descriptionText = failure?.name
    ? `Главный приз сбоя «${failure.name}»`
    : null;

  const authError = !tokens ? "Авторизуйтесь, чтобы увидеть призы" : null;

  return (
    <StyledWrapper>
      <Header
        infoType="prize"
        handleClose={handleClose}
        prizeBalance={balance}
      />
      <SectionInfo InfoName={"НАГРАДЫ ТЕКУЩЕГО СБОЯ"} />
      {isLoading ? (
        <Placeholder>
          <LoadingSpinner label="Обновляем информацию" />
        </Placeholder>
      ) : authError ? (
        <Placeholder>{authError}</Placeholder>
      ) : isError && !failure ? (
        <Placeholder>Не удалось загрузить данные о призах</Placeholder>
      ) : (
        <>
          <PrizeCard
            mainPrizeTitle={mainPrizeTitle}
            mainPrizeImage={mainPrizeImage}
            timerLabel={timerLabel}
            timerValue={displayTimerValue}
            completionNote={completionNote}
          />
          <PrizeDescription
            description={descriptionText}
            currentDate={currentDate}
            rewardCoins={null}
          />
        </>
      )}
    </StyledWrapper>
  );
}
