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
import {
  SimulationConfigResponse,
  SimulationStartResponse,
} from "../shared/api/types";
import useGlobalStore from "../shared/store/useGlobalStore";

const StyledWrapper = styled.div`
  height: 100vh;
  width: 100%;
  backdrop-filter: blur(40px);
`;

const StyledBtnContentWrapper = styled.div`
  display: flex;
  margin: auto;
  width: 20px;
  height: 20px;
`;

const StyledBtnContentImg = styled.img`
  width: 100%;
  height: 100%;
`;

const BtnContent = () => (
  <StyledBtnContentWrapper>
    <StyledBtnContentImg src={black_advert} alt="advert" />
  </StyledBtnContentWrapper>
);

type ModalState = "" | "insufficient" | "success";

const Simulation = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((state) => state.updateBalance);
  const balance = useGlobalStore((state) => state.balance);
  const [config, setConfig] = useState<SimulationConfigResponse | null>(null);
  const [modalState, setModalState] = useState<ModalState>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!tokens) {
      return;
    }

    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const data = await request<SimulationConfigResponse>("/simulation/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
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
    if (!config) {
      return "";
    }

    return `0 / ${config.cost}`;
  }, [config]);

  const handleStart = async () => {
    if (!tokens || !config) {
      setModalState("insufficient");
      setModalMessage("Пожалуйста, авторизуйтесь, чтобы начать симуляцию.");
      return;
    }

    if (balance < config.cost) {
      setModalState("insufficient");
      setModalMessage("Недостаточно CRASH. Запустите рекламу, чтобы пополнить баланс.");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await request<SimulationStartResponse>("/simulation/start/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
      });
      updateBalance(data.balance);
      setModalState("success");
      setModalMessage(data.detail);
    } catch (error) {
      if (error instanceof ApiError) {
        try {
          const parsed = JSON.parse(error.message) as { detail?: string; balance?: number; required?: number };
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
    }
  };

  return (
    <>
      <StyledWrapper>
        <CoinCount />
        <SectionInfo InfoName="СИМУЛЯЦИЯ" InfoExtra={infoExtra} />
        <SectionContent
          description={config?.description ?? ""}
          cost={config?.cost ?? 0}
          onStart={handleStart}
          isProcessing={isProcessing}
        />
        <SimulationRoadMap />
        <SimulationTimer />
      </StyledWrapper>
      {modalState ? (
        <ModalLayout isOpen={Boolean(modalState)} setIsOpen={handleModalToggle}>
          <ModalWindow
            header={modalState === "success" ? "СИМУЛЯЦИЯ ЗАПУЩЕНА" : "НЕДОСТАТОЧНО CRASH"}
            text={modalMessage}
            btnContent={modalState === "insufficient" ? <BtnContent /> : undefined}
            isOpenModal={Boolean(modalState)}
            setOpenModal={handleModalToggle}
          />
        </ModalLayout>
      ) : null}
    </>
  );
};

export default Simulation;
