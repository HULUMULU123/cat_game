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

const StyledWrapper = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  backdrop-filter: blur(40px);
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
  font-size: 12px;
  color: var(--color-main);
  text-transform: uppercase;
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

  const [config, setConfig] = useState<SimulationConfigResponse | null>(null);
  const [modalState, setModalState] = useState<ModalState>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [isGameRunning, setIsGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const practiceWindowRef = useRef<Window | null>(null);

  const closePracticeWindow = useCallback(() => {
    const win = practiceWindowRef.current;
    if (win && !win.closed) {
      win.close();
    }
    practiceWindowRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      closePracticeWindow();
    };
  }, [closePracticeWindow]);

  const handlePracticeClosed = useCallback(
    (interrupted: boolean) => {
      setIsGameRunning(false);
      if (interrupted) {
        setScore(0);
        setResultModalOpen(false);
      }
      closePracticeWindow();
    },
    [closePracticeWindow]
  );

  const handlePracticeFinished = useCallback((finalScore: number) => {
    setScore(finalScore);
    setIsGameRunning(false);
    setResultModalOpen(true);
  }, []);

  const preparePracticeWindow = useCallback(() => {
    closePracticeWindow();

    const width = 420;
    const height = 780;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
    ].join(",");

    const win = window.open("", "simulation_practice", features);
    if (!win) {
      return null;
    }

    try {
      win.document.title = "Тренировка сбоя";
      win.document.body.innerHTML = "";
      win.document.body.style.margin = "0";
      win.document.body.style.background =
        "linear-gradient(180deg, rgba(0, 31, 25, 0.92) 0%, rgba(0, 9, 7, 0.96) 100%)";
      win.document.body.style.display = "flex";
      win.document.body.style.alignItems = "center";
      win.document.body.style.justifyContent = "center";

      const placeholder = win.document.createElement("div");
      placeholder.style.fontFamily = '"Conthrax", sans-serif';
      placeholder.style.fontSize = "14px";
      placeholder.style.color = "rgba(199, 247, 238, 0.92)";
      placeholder.style.padding = "24px";
      placeholder.style.textAlign = "center";
      placeholder.textContent = "Подготавливаем тренировку…";
      win.document.body.appendChild(placeholder);
    } catch (error) {
      console.warn("Не удалось подготовить окно симуляции", error);
    }

    practiceWindowRef.current = win;
    return win;
  }, [closePracticeWindow]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const message = data as Partial<PracticeWindowMessage>;
      if (message?.source !== "simulation-practice") return;

      if (message.type === "finished") {
        const rawScore = message.payload?.score;
        const parsed = Number(rawScore ?? 0);
        handlePracticeFinished(Number.isFinite(parsed) ? parsed : 0);
      } else if (message.type === "closed") {
        const interrupted = Boolean(message.payload?.interrupted);
        handlePracticeClosed(interrupted);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handlePracticeClosed, handlePracticeFinished]);

  useEffect(() => {
    if (!tokens) return;

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const data = await request<SimulationConfigResponse>("/simulation/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (isMounted) {
          setConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch simulation config", error);
      }
    };

    void fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [tokens]);

  const infoExtra = useMemo(() => {
    if (!config) return "";
    return `0 / ${config.attempt_cost}`;
  }, [config]);

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

    const practiceWindow = preparePracticeWindow();
    if (!practiceWindow) {
      setModalState("error");
      setModalMessage(
        "Разрешите открытие нового окна тренировки сбоя в настройках браузера."
      );
      return;
    }

    setIsProcessing(true);
    let launched = false;
    try {
      const data = await request<SimulationStartResponse>("/simulation/start/", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.access}` },
      });

      updateBalance(data.balance);
      setModalState("");
      setModalMessage("");
      const safeDuration =
        data.duration_seconds ?? config.duration_seconds ?? 60;
      const practiceUrl = new URL(
        "/simulation/practice/",
        window.location.origin
      );
      practiceUrl.searchParams.set("duration", String(safeDuration));
      practiceWindow.location.replace(practiceUrl.toString());
      practiceWindow.focus();
      launched = true;
      setScore(0);
      setResultModalOpen(false);
      setIsGameRunning(true);
    } catch (error) {
      closePracticeWindow();
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
      if (!launched) {
        closePracticeWindow();
      }
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

  return (
    <>
      <StyledWrapper>
        <CoinCount />
        <SectionInfo InfoName="СИМУЛЯЦИЯ" InfoExtra={infoExtra} />

        <SectionContent
          description={config?.description ?? ""}
          cost={config?.attempt_cost ?? 0}
          onStart={handleStart}
          isDisabled={isProcessing || isGameRunning}
        />

        <SimulationRoadMap
          attemptCost={config?.attempt_cost ?? 0}
          reward1={config?.reward_level_1 ?? 0}
          reward2={config?.reward_level_2 ?? 0}
          reward3={config?.reward_level_3 ?? 0}
        />
      </StyledWrapper>

      {modalState ? (
        <ModalLayout isOpen={Boolean(modalState)} setIsOpen={handleModalToggle}>
          <ModalWindow
            header={
              modalState === "success"
                ? "БАЛАНС ПОПОЛНЕН"
                : modalState === "error"
                ? "ОШИБКА"
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
    </>
  );
};

export default Simulation;
