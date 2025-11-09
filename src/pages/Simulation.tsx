import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import CoinCount from "../components/common/CoinCount";
import SectionInfo from "../components/common/SectionInfo";
import SectionContent from "../components/simulation/SectionContent";
import SimulationRoadMap from "../components/simulation/SimulationRoadMap";
import ModalLayout from "../components/modalWindow/ModalLayout";
import ModalWindow from "../components/modalWindow/ModalWindow";
import black_advert from "../assets/icons/black_advert.svg";
import { request, ApiError } from "../shared/api/httpClient";
import type {
  SimulationConfigResponse,
  SimulationStartResponse,
  SimulationAdRewardResponse,
} from "../shared/api/types";
import useGlobalStore from "../shared/store/useGlobalStore";
import useAdsgramAd, { AdsgramStatus } from "../shared/hooks/useAdsgramAd";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import FailureFooter from "../components/failure/footer/FailureFooter";
import Droplets from "../components/failure/droplets/Droplets";
import { useQuery } from "react-query";
import LoadingSpinner from "../shared/components/LoadingSpinner";

const StyledWrapper = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  backdrop-filter: blur(40px);
`;

const Placeholder = styled.div`
  width: 92%;
  margin: 32px auto 0;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: var(--color-white-text);
`;

const StyledBtnContentWrapper = styled.div`
  display: flex;
  margin: auto;
  align-items: center;
  gap: 8px;
`;

const StyledBtnContentImg = styled.img`
  width: 20px;
  height: 20px;
`;

const StyledBtnContentText = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 8px;
  color: var(--color-main);
  text-transform: uppercase;
`;

const GameOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: linear-gradient(
    180deg,
    rgba(0, 31, 25, 0.92) 0%,
    rgba(0, 9, 7, 0.96) 100%
  );
`;

const GameInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const GameHeaderWrapper = styled.div`
  position: absolute;
  top: 16px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`;

const GameHeaderInner = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const GameFooterWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 2;
`;

const btnLabelByStatus = (status: AdsgramStatus): string => {
  switch (status) {
    case "awaiting":
      return "Инициализация";
    case "confirming":
      return "Подтверждение";
    case "completed":
      return "Просмотрено";
    case "requesting":
      return "Запрос";
    default:
      return "Смотреть рекламу";
  }
};

const BtnContent = ({ status }: { status: AdsgramStatus }) => (
  <StyledBtnContentWrapper>
    <StyledBtnContentImg src={black_advert} alt="advert" />
    <StyledBtnContentText>{btnLabelByStatus(status)}</StyledBtnContentText>
  </StyledBtnContentWrapper>
);

type ModalState = "" | "insufficient" | "success" | "error";

type PracticeWindowMessage = {
  source: "simulation-practice";
  type: "finished" | "closed";
  payload?: {
    score?: number;
    interrupted?: boolean;
  };
};

const Simulation = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);
  const balance = useGlobalStore((state) => state.balance);

  const {
    startAdFlow,
    isLoading: isAdLoading,
    status: adsStatus,
    error: adsError,
    reset: resetAds,
  } = useAdsgramAd();

  const [modalState, setModalState] = useState<ModalState>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameDuration, setGameDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practiceModalMessage, setPracticeModalMessage] = useState("");

  const practiceWindowRef = useRef<Window | null>(null);

  const {
    data: config,
    isLoading: configLoading,
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
      console.error("Failed to fetch simulation config", configError);
    }
  }, [configError, isConfigError]);

  useEffect(() => {
    if (!config) return;
    setGameDuration(config.duration_seconds ?? 60);
    setTimeLeft(config.duration_seconds ?? 60);
  }, [config]);

  useEffect(() => {
    if (!isGameRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsGameRunning(false);
          setResultModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isGameRunning]);

  const infoExtra = useMemo(() => {
    if (!config) return "";
    return `0 / ${config.reward_threshold_3 ?? config.attempt_cost}`;
  }, [config]);

  const configErrorMessage = useMemo(() => {
    if (!tokens) return "Авторизуйтесь, чтобы запустить симуляцию";
    if (isConfigError) return "Не удалось загрузить данные симуляции";
    return null;
  }, [isConfigError, tokens]);

  const startGameSession = useCallback((duration: number) => {
    const safeDuration = duration > 0 ? duration : 60;
    setScore(0);
    setGameDuration(safeDuration);
    setTimeLeft(safeDuration);
    setResultModalOpen(false);
    setIsGameRunning(true);
  }, []);

  // Открывает практику в текущей вкладке (без popup).
  const handlePracticeStart = useCallback(
    (durationOverride?: number) => {
      const durationSeconds =
        typeof durationOverride === "number"
          ? durationOverride
          : config?.duration_seconds ?? gameDuration ?? 60;

      const origin = window.location.origin;
      const practiceUrl = new URL("/simulation/practice/", origin);
      practiceUrl.searchParams.set("duration", String(durationSeconds));

      // Переход в текущей вкладке (никаких новых окон)
      window.location.assign(practiceUrl.toString());
    },
    [config?.duration_seconds, gameDuration]
  );

  const handleStart = async () => {
    if (!tokens || !config) {
      setModalState("insufficient");
      setModalMessage("Пожалуйста, авторизуйтесь, чтобы начать симуляцию.");
      return;
    }

    if (balance < config.attempt_cost) {
      setModalState("insufficient");
      setModalMessage(
        "Недостаточно CRASH. Запустите рекламу, чтобы пополнить баланс."
      );
      return;
    }

    setIsProcessing(true);
    try {
      // ВАЖНО: ведущий слэш в пути
      const data = await request<SimulationStartResponse>(
        "/simulation/start/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      // Обновляем баланс после списания
      updateBalance(data.balance);

      // Чистим модалку
      setModalState("");
      setModalMessage("");

      // Открываем страницу практики в этой же вкладке
      const duration = data.duration_seconds ?? config.duration_seconds ?? 60;
      handlePracticeStart(duration);
    } catch (error) {
      if (error instanceof ApiError) {
        try {
          const parsed = JSON.parse(error.message) as {
            detail?: string;
            balance?: number;
            required?: number;
          };
          setModalState("insufficient");
          setModalMessage(parsed.detail ?? "Недостаточно средств для запуска.");
          if (typeof parsed.balance === "number") {
            updateBalance(parsed.balance);
          }
        } catch {
          setModalState("insufficient");
          setModalMessage("Не удалось запустить симуляцию.");
        }
      } else {
        setModalState("insufficient");
        setModalMessage("Не удалось запустить симуляцию.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalToggle = (value: boolean) => {
    if (!value) {
      setModalState("");
      setModalMessage("");
      resetAds();
    }
  };

  const handleResultModalToggle = (value: boolean) => {
    if (!value) {
      setResultModalOpen(false);
      setScore(0);
      setTimeLeft(config?.duration_seconds ?? gameDuration);
    }
  };

  const handlePracticeModalToggle = (value: boolean) => {
    if (!value) {
      setPracticeModalOpen(false);
      setPracticeModalMessage("");
    }
  };

  const handleWatchAd = async () => {
    if (!tokens) {
      setModalMessage("Пожалуйста, авторизуйтесь, чтобы пополнить баланс.");
      return;
    }

    try {
      await startAdFlow();
      const rewardResponse = await request<SimulationAdRewardResponse>(
        "/simulation/ad-reward/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );
      updateBalance(rewardResponse.balance);
      setModalState("success");
      setModalMessage(
        `На баланс начислено ${rewardResponse.reward} CRASH за просмотр рекламы.`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        try {
          const parsed = JSON.parse(error.message) as { detail?: string };
          if (parsed.detail) {
            setModalMessage(parsed.detail);
          } else {
            setModalMessage("Не удалось воспроизвести рекламу.");
          }
        } catch {
          setModalMessage("Не удалось воспроизвести рекламу.");
        }
      } else if (error instanceof Error) {
        setModalState("insufficient");
        setModalMessage(error.message);
        return;
      } else {
        setModalState("insufficient");
        setModalMessage("Не удалось воспроизвести рекламу.");
        return;
      }

      setModalState("insufficient");
    }
  };

  useEffect(() => {
    if (modalState !== "insufficient") return;

    if (adsStatus === "awaiting") {
      setModalMessage("Запускаем рекламный показ Adsgram…");
    } else if (adsStatus === "confirming") {
      setModalMessage("Подтверждаем выполнение задания Adsgram…");
    }
  }, [adsStatus, modalState]);

  useEffect(() => {
    if (!adsError) return;
    setModalState("insufficient");
    setModalMessage(adsError);
  }, [adsError]);

  const handlePop = useCallback(() => {
    if (!isGameRunning) return;
    setScore((prev) => prev + 1);
  }, [isGameRunning]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PracticeWindowMessage>) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.source !== "simulation-practice") return;

      if (data.type === "finished") {
        practiceWindowRef.current = null;
        const scoreValue = data.payload?.score ?? 0;
        setPracticeModalMessage(
          `Тренировка завершена. Вы сбили ${scoreValue} капель.`
        );
        setPracticeModalOpen(true);
        return;
      }

      if (data.type === "closed") {
        const interrupted = Boolean(data.payload?.interrupted);
        practiceWindowRef.current = null;
        if (interrupted) {
          setPracticeModalMessage(
            "Тренировка прервана. Результат не сохраняется — попробуйте ещё раз."
          );
          setPracticeModalOpen(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    return () => {
      if (practiceWindowRef.current && !practiceWindowRef.current.closed) {
        practiceWindowRef.current.close();
      }
    };
  }, []);

  return (
    <>
      <StyledWrapper>
        <CoinCount />
        <SectionInfo InfoName="СИМУЛЯЦИЯ" InfoExtra={infoExtra} />

        {configLoading ? (
          <Placeholder>
            <LoadingSpinner label="Загружаем симуляцию" />
          </Placeholder>
        ) : configErrorMessage ? (
          <Placeholder>{configErrorMessage}</Placeholder>
        ) : (
          <>
            <SectionContent
              description={config?.description ?? ""}
              cost={config?.attempt_cost ?? 0}
              onStart={handleStart}
              isDisabled={isProcessing || isGameRunning}
              onPracticeStart={handlePracticeStart}
              isPracticeDisabled={isProcessing || isGameRunning}
            />

            <SimulationRoadMap
              thresholds={[
                config?.reward_threshold_1 ?? 0,
                config?.reward_threshold_2 ?? 0,
                config?.reward_threshold_3 ?? 0,
              ]}
              rewards={[
                config?.reward_amount_1 ?? config?.reward_level_1 ?? 0,
                config?.reward_amount_2 ?? config?.reward_level_2 ?? 0,
                config?.reward_amount_3 ?? config?.reward_level_3 ?? 0,
              ]}
            />
          </>
        )}
      </StyledWrapper>

      {isGameRunning ? (
        <GameOverlay>
          <GameInner>
            <GameHeaderWrapper>
              <GameHeaderInner>
                <FailrueHeader timeLeft={timeLeft} duration={gameDuration} />
              </GameHeaderInner>
            </GameHeaderWrapper>

            <Droplets onPop={handlePop} />

            <GameFooterWrapper>
              <FailureFooter score={score} />
            </GameFooterWrapper>
          </GameInner>
        </GameOverlay>
      ) : null}

      {modalState ? (
        <ModalLayout isOpen={Boolean(modalState)} setIsOpen={handleModalToggle}>
          <ModalWindow
            header={
              modalState === "success"
                ? "БАЛАНС ПОПОЛНЕН"
                : "НЕДОСТАТОЧНО CRASH"
            }
            text={modalMessage}
            btnContent={
              modalState === "insufficient" ? (
                <BtnContent status={adsStatus} />
              ) : undefined
            }
            onAction={modalState === "insufficient" ? handleWatchAd : undefined}
            isActionLoading={isAdLoading}
            isOpenModal={Boolean(modalState)}
            setOpenModal={handleModalToggle}
          />
        </ModalLayout>
      ) : null}

      {resultModalOpen ? (
        <ModalLayout
          isOpen={resultModalOpen}
          setIsOpen={handleResultModalToggle}
        >
          <ModalWindow
            header="СИМУЛЯЦИЯ ЗАВЕРШЕНА"
            text={`Вы сбили ${score} капель. Результат не сохраняется — тренируйтесь ещё!`}
            isOpenModal={resultModalOpen}
            setOpenModal={handleResultModalToggle}
          />
        </ModalLayout>
      ) : null}

      {practiceModalOpen ? (
        <ModalLayout
          isOpen={practiceModalOpen}
          setIsOpen={handlePracticeModalToggle}
        >
          <ModalWindow
            header="ПРОБНЫЙ СБОЙ"
            text={practiceModalMessage || "Тренировка завершена."}
            isOpenModal={practiceModalOpen}
            setOpenModal={handlePracticeModalToggle}
          />
        </ModalLayout>
      ) : null}
    </>
  );
};

export default Simulation;
