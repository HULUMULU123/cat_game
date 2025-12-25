import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";

import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";
import useGlobalStore from "../shared/store/useGlobalStore";
import { request, ApiError } from "../shared/api/httpClient";
import {
  SimulationConfigResponse,
  SimulationRewardClaimResponse,
} from "../shared/api/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../shared/components/LoadingSpinner";

const PageWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(0, 31, 25, 0.92) 0%,
    rgba(0, 9, 7, 0.96) 100%
  );
`;

const HeaderLayer = styled.div`
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`;

const HeaderInner = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: auto;
`;

const FooterLayer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(14, 94, 81, 0.92);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 2px;
    border-radius: 1px;
    background: #c7f7ee;
    transition: background 0.2s ease;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }

  &:hover {
    background: rgba(20, 132, 111, 0.96);
    transform: translateY(-1px);
  }
`;

const CloseButtonLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ResultOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  background: rgba(0, 0, 0, 0.68);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  gap: 16px;
`;

const ResultTitle = styled.h2`
  margin: 0;
  font-family: "Conthrax", sans-serif;
  font-size: 20px;
  text-transform: uppercase;
  color: #e1fffb;
  text-shadow: 0 0 16px rgba(44, 194, 169, 0.65);
`;

const ResultText = styled.p`
  margin: 0;
  font-family: "Conthrax", sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(199, 247, 238, 0.92);
`;

const ResultButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  color: #0e4f45;
  background: linear-gradient(
    216deg,
    rgba(76, 204, 181, 0.9) 0%,
    rgba(168, 244, 219, 0.7) 50%
  );
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(31, 255, 227, 0.35);
  }
`;

const RewardBanner = styled.div<{ $error?: boolean }>`
  position: absolute;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 12px;
  background: ${({ $error }) =>
    $error ? "rgba(196, 70, 70, 0.9)" : "rgba(30, 180, 150, 0.85)"};
  color: #e9fffb;
  font-family: "Conthrax", sans-serif;
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  z-index: 3;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 9, 7, 0.78);
  z-index: 5;
`;

type PracticeMessagePayload = {
  source: "simulation-practice";
  type: "finished" | "closed";
  payload?: {
    score?: number;
    interrupted?: boolean;
  };
};

const clampDuration = (value: number): number => {
  if (!Number.isFinite(value)) return 60;
  const safe = Math.max(5, Math.floor(value));
  return safe;
};

const SimulationPractice = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setBottomNavVisible = useGlobalStore(
    (state) => state.setBottomNavVisible
  );

  const requestedDuration = Number.parseInt(
    searchParams.get("duration") ?? "",
    10
  );
  const duration = useMemo(
    () => clampDuration(requestedDuration),
    [requestedDuration]
  );

  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);

  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);

  const endRef = useRef<number | null>(null);
  const runningRef = useRef(isRunning);
  const finishedRef = useRef(isFinished);
  const scoreRef = useRef(score);
  const notifiedRef = useRef(false);
  const rewardClaimedRef = useRef(false);
  const rewardTimeoutRef = useRef<number | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  useEffect(() => {
    runningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    finishedRef.current = isFinished;
  }, [isFinished]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    document.title = "Тренировка сбоя";
    const prevOverflow = document.body.style.overflow;
    const prevMargin = document.body.style.margin;
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    setBottomNavVisible(false);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.margin = prevMargin;
      setBottomNavVisible(true);
      if (rewardTimeoutRef.current) {
        window.clearTimeout(rewardTimeoutRef.current);
        rewardTimeoutRef.current = null;
      }
    };
  }, [setBottomNavVisible]);

  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
  } = useQuery<SimulationConfigResponse>({
    queryKey: ["simulation-config", tokens?.access ?? null],
    enabled: Boolean(tokens),
    queryFn: async () => {
      if (!tokens) throw new Error("missing tokens");
      return request<SimulationConfigResponse>("/simulation/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
  });

  useEffect(() => {
    if (isConfigError && configError) {
      console.error("Failed to load simulation config", configError);
    }
  }, [configError, isConfigError]);

  const parseErrorDetail = useCallback((error: unknown): string => {
    if (error instanceof ApiError) {
      try {
        const parsed = JSON.parse(error.message) as { detail?: string };
        if (parsed.detail) return parsed.detail;
      } catch {
        if (error.message) return error.message;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Не удалось начислить награду.";
  }, []);

  const showBanner = useCallback((message: string, error = false) => {
    if (rewardTimeoutRef.current) {
      window.clearTimeout(rewardTimeoutRef.current);
    }
    setBanner({ message, error });
    rewardTimeoutRef.current = window.setTimeout(() => {
      setBanner(null);
      rewardTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    endRef.current = Date.now() + duration * 1000;
    setTimeLeft(duration);
    setScore(0);
    setIsFinished(false);
    setIsRunning(true);
    notifiedRef.current = false;
    rewardClaimedRef.current = false;
    setRewardMessage(null);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    if (!endRef.current) {
      endRef.current = Date.now() + duration * 1000;
    }

    const tick = () => {
      if (!endRef.current) return;
      const diff = Math.max(endRef.current - Date.now(), 0);
      const remaining = Math.max(Math.ceil(diff / 1000), 0);
      setTimeLeft(remaining);

      if (remaining === 0) {
        endRef.current = null;
        setIsRunning(false);
        setIsFinished(true);
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [duration, isRunning]);

  const postMessageToOpener = useCallback((message: PracticeMessagePayload) => {
    if (!window.opener || window.opener.closed) return;
    window.opener.postMessage(message, "*");
  }, []);

  useEffect(() => {
    if (!isFinished || notifiedRef.current) return;
    postMessageToOpener({
      source: "simulation-practice",
      type: "finished",
      payload: { score: scoreRef.current },
    });
    notifiedRef.current = true;
  }, [isFinished, postMessageToOpener]);

  useEffect(() => {
    if (!isFinished || rewardClaimedRef.current || !tokens) return;
    rewardClaimedRef.current = true;

    (async () => {
      try {
        const response = await request<SimulationRewardClaimResponse>(
          "/simulation/reward-claim/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ score: scoreRef.current }),
          }
        );
        updateBalance(response.balance);
        const message = `Награда начислена: +${response.reward} CRASH`;
        setRewardMessage(message);
        showBanner(message, false);
      } catch (error) {
        const detail = parseErrorDetail(error);
        setRewardMessage(detail);
        showBanner(detail, true);
      }
    })();
  }, [isFinished, parseErrorDetail, showBanner, tokens, updateBalance]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const interrupted = runningRef.current && !finishedRef.current;
      postMessageToOpener({
        source: "simulation-practice",
        type: "closed",
        payload: { interrupted },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [postMessageToOpener]);

  const handlePop = useCallback(() => {
    if (!runningRef.current) return;
    setScore((prev) => {
      const next = prev + 1;
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    const interrupted = runningRef.current && !finishedRef.current;
    postMessageToOpener({
      source: "simulation-practice",
      type: "closed",
      payload: { interrupted },
    });

    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      navigate("/simulation/");
    }
  }, [navigate, postMessageToOpener]);

  return (
    <PageWrapper>
      {banner ? (
        <RewardBanner $error={banner.error}>{banner.message}</RewardBanner>
      ) : null}
      <HeaderLayer>
        <HeaderInner>
          <FailrueHeader timeLeft={timeLeft} duration={duration} />
        </HeaderInner>
      </HeaderLayer>

      {/* <CloseButton onClick={handleClose} aria-label="Закрыть тренировку">
        <CloseButtonLabel>Закрыть тренировку</CloseButtonLabel>
      </CloseButton> */}

      {isRunning ? <Droplets onPop={handlePop} /> : null}

      <FooterLayer>
        <FailureFooter score={score} />
      </FooterLayer>

      {isConfigLoading && !config ? (
        <LoadingOverlay>
          <LoadingSpinner label="Загрузка тренировки..." />
        </LoadingOverlay>
      ) : null}

      {isFinished ? (
        <ResultOverlay>
          <ResultTitle>Тренировка завершена</ResultTitle>
          <ResultText>
            Вы собрали {scoreRef.current} капель. Продолжайте тренировки!
          </ResultText>
          {rewardMessage ? <ResultText>{rewardMessage}</ResultText> : null}
          <ResultButton onClick={handleClose}>Закрыть тренировку</ResultButton>
        </ResultOverlay>
      ) : null}
    </PageWrapper>
  );
};

export default SimulationPractice;
