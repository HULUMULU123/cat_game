import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";

import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";

const PageWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0, 31, 25, 0.92) 0%, rgba(0, 9, 7, 0.96) 100%);
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
  top: 16px;
  right: 16px;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-family: "Conthrax", sans-serif;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #c7f7ee;
  background: rgba(14, 94, 81, 0.92);
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 3;

  &:hover {
    background: rgba(20, 132, 111, 0.96);
  }
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
  background: linear-gradient(216deg, rgba(76, 204, 181, 0.9) 0%, rgba(168, 244, 219, 0.7) 50%);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(31, 255, 227, 0.35);
  }
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

  const requestedDuration = Number.parseInt(searchParams.get("duration") ?? "", 10);
  const duration = useMemo(() => clampDuration(requestedDuration), [requestedDuration]);

  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const startRef = useRef<number | null>(null);
  const runningRef = useRef(isRunning);
  const finishedRef = useRef(isFinished);
  const scoreRef = useRef(score);
  const notifiedRef = useRef(false);

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
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(duration);
    setScore(0);
    setIsFinished(false);
    setIsRunning(true);
    notifiedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    startRef.current = Date.now();

    const tick = () => {
      if (!startRef.current) return;
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const remaining = Math.max(duration - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining === 0) {
        setIsRunning(false);
        setIsFinished(true);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [duration, isRunning]);

  const postMessageToOpener = useCallback(
    (message: PracticeMessagePayload) => {
      if (!window.opener || window.opener.closed) return;
      window.opener.postMessage(message, "*");
    },
    []
  );

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
    setScore((prev) => prev + 1);
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
      <HeaderLayer>
        <HeaderInner>
          <FailrueHeader timeLeft={timeLeft} duration={duration} />
        </HeaderInner>
      </HeaderLayer>

      <CloseButton onClick={handleClose}>Закрыть</CloseButton>

      {isRunning ? <Droplets onPop={handlePop} /> : null}

      <FooterLayer>
        <FailureFooter score={score} />
      </FooterLayer>

      {isFinished ? (
        <ResultOverlay>
          <ResultTitle>Тренировка завершена</ResultTitle>
          <ResultText>Вы сбили {scoreRef.current} капель. Продолжайте тренировки!</ResultText>
          <ResultButton onClick={handleClose}>Закрыть тренировку</ResultButton>
        </ResultOverlay>
      ) : null}
    </PageWrapper>
  );
};

export default SimulationPractice;
