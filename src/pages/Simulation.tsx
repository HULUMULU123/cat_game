import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import CoinCount from "../components/common/CoinCount";
import SectionInfo from "../components/common/SectionInfo";
import SectionContent from "../components/simulation/SectionContent";
import SimulationRoadMap from "../components/simulation/SimulationRoadMap";
import SimulationTimer from "../components/simulation/SimulationTimer";
import ModalLayout from "../components/modalWindow/ModalLayout";
import ModalWindow from "../components/modalWindow/ModalWindow";
import black_advert from "../assets/icons/black_advert.svg";
import { request, ApiError } from "../shared/api/httpClient";
import type {
  SimulationConfigResponse,
  SimulationStartResponse,
} from "../shared/api/types";

import useGlobalStore from "../shared/store/useGlobalStore";
import useAdsgramAd, { AdsgramStatus } from "../shared/hooks/useAdsgramAd";

const StyledWrapper = styled.div`
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

type ModalState = "" | "insufficient" | "success";

const Simulation = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);
  const balance = useGlobalStore((state) => state.balance);
  const refreshBalance = useGlobalStore((state) => state.refreshBalance);

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

  useEffect(() => {
    if (!tokens) return;

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        // ВАЖНО: бэк отдаёт attempt_cost и три уровня наград
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

  // "0 / <attempt_cost>" для шапки раздела
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

    // Проверяем баланс против attempt_cost
    if (balance < config.attempt_cost) {
      setModalState("insufficient");
      setModalMessage(
        "Недостаточно CRASH. Запустите рекламу, чтобы пополнить баланс."
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Бэк сам спишет attempt_cost, вернёт новый баланс
      const data = await request<SimulationStartResponse>(
        "/simulation/start/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      // обновим баланс из ответа
      updateBalance(data.balance);

      setModalState("success");
      setModalMessage(data.detail);
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

  const handleWatchAd = async () => {
    try {
      await startAdFlow();
      setModalState("success");
      setModalMessage(
        "Спасибо! Реклама Adsgram просмотрена, баланс будет обновлён автоматически.",
      );
      await refreshBalance();
    } catch (error) {
      if (error instanceof Error) {
        setModalState("insufficient");
        setModalMessage(error.message);
      } else {
        setModalState("insufficient");
        setModalMessage("Не удалось воспроизвести рекламу.");
      }
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
          // показываем актуальную цену запуска
          cost={config?.attempt_cost ?? 0}
          onStart={handleStart}
          isProcessing={isProcessing}
        />

        {/* Дорожная карта наград: подтягиваем уровни с бэка */}
        <SimulationRoadMap
          attemptCost={config?.attempt_cost ?? 0}
          reward1={config?.reward_level_1 ?? 0}
          reward2={config?.reward_level_2 ?? 0}
          reward3={config?.reward_level_3 ?? 0}
        />

        <SimulationTimer />
      </StyledWrapper>

      {modalState ? (
        <ModalLayout isOpen={Boolean(modalState)} setIsOpen={handleModalToggle}>
          <ModalWindow
            header={
              modalState === "success"
                ? "СИМУЛЯЦИЯ ЗАПУЩЕНА"
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
    </>
  );
};

export default Simulation;
