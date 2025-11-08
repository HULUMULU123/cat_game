import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";
import ModalLayout from "../components/modalWindow/ModalLayout";
import ModalWindow from "../components/modalWindow/ModalWindow";
import { createPortal } from "react-dom";
import { request, ApiError } from "../shared/api/httpClient";
import type {
  FailureResponse,
  FailureStartResponse,
  FailureCompleteResponse,
} from "../shared/api/types";
import useGlobalStore from "../shared/store/useGlobalStore";

/** загрузочный экран */
import StakanLoader from "../shared/components/stakan/StakanLoader";
import wordmark from "../assets/STAKAN.svg";

/* ====================== Стили ====================== */

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.6s ease;
  &.visible {
    opacity: 1;
  }
`;

const StyledHeaderWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
`;

const StyledFooterWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
`;

/* Лоадер — поверх всего */
const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 420ms ease;
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
  /* избегаем неожиданных пересчётов layout */
  background: transparent;
`;

/* ====================== Хелперы ожидания ====================== */

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitImages(container: HTMLElement) {
  const imgs = Array.from(
    container.querySelectorAll("img")
  ) as HTMLImageElement[];
  const pending = imgs.filter((i) => !i.complete);
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((res) => {
            const done = () => res();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
      )
    ),
    sleep(2500),
  ]);
}

async function waitVideosMeta(container: HTMLElement) {
  const vids = Array.from(
    container.querySelectorAll("video")
  ) as HTMLVideoElement[];
  const pending = vids.filter((v) => v.readyState < 2);
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(
      pending.map(
        (v) =>
          new Promise<void>((res) => {
            const done = () => res();
            v.addEventListener("loadeddata", done, { once: true });
            v.addEventListener("canplaythrough", done, { once: true });
            v.addEventListener("error", done, { once: true });
          })
      )
    ),
    sleep(2500),
  ]);
}

async function waitFonts() {
  try {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await Promise.race([document.fonts.ready, sleep(1500)]);
    }
  } catch {}
}

async function ensureStableReady(container: HTMLElement) {
  if (document.readyState !== "complete") {
    await new Promise<void>((res) =>
      window.addEventListener("load", () => res(), { once: true })
    );
  }
  await waitFonts();
  await waitImages(container);
  await waitVideosMeta(container);
  await nextFrame();
  await nextFrame();
  await sleep(120);
}

/* ====================== Мемо-обёртки ====================== */

const HeaderMemo: React.FC<{ timeLeft: number; duration: number }> = React.memo(
  ({ timeLeft, duration }) => (
    <StyledHeaderWrapper>
      <FailrueHeader timeLeft={timeLeft} duration={duration} />
    </StyledHeaderWrapper>
  )
);
HeaderMemo.displayName = "HeaderMemo";

const FooterMemo: React.FC<{ score: number }> = React.memo(({ score }) => (
  <StyledFooterWrapper>
    <FailureFooter score={score} />
  </StyledFooterWrapper>
));
FooterMemo.displayName = "FooterMemo";

/* ====================== Страница ====================== */

export default function Failure() {
  const tokens = useGlobalStore((state) => state.tokens);
  const [score, setScore] = useState(0);
  const [failure, setFailure] = useState<FailureResponse | null>(null);
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [startMessage, setStartMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Покадровый сценарий загрузки
  const [contentVisible, setContentVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true); // видимость (фейд)
  const [showLoaderNode, setShowLoaderNode] = useState(true); // наличие узла портала

  const wrapperRef = useRef<HTMLDivElement>(null);
  const finishGameRef = useRef<() => void>(() => {});

  const parseErrorDetail = useCallback(
    (error: unknown, fallback: string): string => {
      if (error instanceof ApiError) {
        try {
          const parsed = JSON.parse(error.message) as { detail?: string };
          if (typeof parsed.detail === "string" && parsed.detail.trim()) {
            return parsed.detail;
          }
        } catch {}
        return error.message || fallback;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return fallback;
    },
    []
  );

  const handlePop = useCallback(() => {
    if (!isGameRunning) return;
    setScore((s) => s + 1);
  }, [isGameRunning]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const root = wrapperRef.current || document.body;

      const watchdog = sleep(5000).then(() => {
        if (alive)
          console.warn("[Failure] Ready watchdog fired -> forcing show");
      });

      await Promise.race([ensureStableReady(root), watchdog]);

      if (!alive) return;

      setContentVisible(true);
      await sleep(220);
      setLoaderVisible(false);
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!tokens) {
      if (!startModalOpen) {
        setStartMessage("Необходимо авторизоваться для участия в сбое.");
        setStartModalOpen(true);
      }
      return;
    }

    let active = true;

    (async () => {
      try {
        const data = await request<FailureResponse[]>("/failures/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (!active) return;
        const current = data.find((item) => item.is_active) ?? null;
        setFailure(current);
        if (current) {
          setDuration(60);
          setTimeLeft(60);
          setStartMessage("У тебя 60 секунд. Кликай по каплям, чтобы набрать как можно больше очков.");
        } else {
          setStartMessage("Активный сбой не найден.");
        }
        if (!isGameRunning && !hasFinished) {
          setStartModalOpen(true);
        }
      } catch (error) {
        if (!active) return;
        setStartMessage(parseErrorDetail(error, "Не удалось загрузить данные сбоя."));
        if (!isGameRunning && !hasFinished) {
          setStartModalOpen(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [tokens, parseErrorDetail, startModalOpen, isGameRunning, hasFinished]);

  const handleStartGame = useCallback(async () => {
    if (!tokens) {
      setStartMessage("Необходимо авторизоваться для участия в сбое.");
      setStartModalOpen(true);
      return;
    }

    if (!failure || !failure.is_active) {
      setStartMessage("Сбой недоступен.");
      return;
    }

    setIsStarting(true);
    try {
      const payload = { failure_id: failure.id };
      const response = await request<FailureStartResponse>("/failures/start/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setDuration(response.duration_seconds);
      setTimeLeft(response.duration_seconds);
      setScore(0);
      setHasFinished(false);
      setResultMessage(null);
      setResultModalOpen(false);
      setIsGameRunning(true);
      setStartModalOpen(false);
    } catch (error) {
      const message = parseErrorDetail(error, "Не удалось начать сбой.");
      setStartMessage(message);
      setHasFinished(message.toLowerCase().includes("уже"));
    } finally {
      setIsStarting(false);
    }
  }, [failure, parseErrorDetail, tokens]);

  const finishGame = useCallback(async () => {
    if (hasFinished) {
      setResultModalOpen(true);
      return;
    }

    setHasFinished(true);
    setIsGameRunning(false);
    setTimeLeft(0);

    if (!tokens || !failure) {
      setResultMessage(`Результат не сохранён. Очки: ${score}`);
      setResultModalOpen(true);
      return;
    }

    try {
      const response = await request<FailureCompleteResponse>("/failures/complete/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          failure_id: failure.id,
          points: score,
          duration_seconds: duration,
        }),
      });
      setResultMessage(`${response.detail} Очки: ${response.score}`);
      useGlobalStore.getState().incrementProfileStat("failures");
    } catch (error) {
      const message = parseErrorDetail(error, "Не удалось сохранить результат.");
      setResultMessage(`${message} Очки: ${score}`);
    } finally {
      setResultModalOpen(true);
    }
  }, [duration, failure, hasFinished, parseErrorDetail, score, tokens]);

  useEffect(() => {
    finishGameRef.current = finishGame;
  }, [finishGame]);

  useEffect(() => {
    if (!isGameRunning) return;

    const startedAt = Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(duration - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining === 0) {
        finishGameRef.current();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [duration, isGameRunning]);

  // Когда лоадер полностью скрылся — размонтируем портал
  const onLoaderTransitionEnd = useCallback(() => {
    if (!loaderVisible) setShowLoaderNode(false);
  }, [loaderVisible]);

  return (
    <>
      {/* Лоадер через портал, размонтируем после анимации */}
      {showLoaderNode &&
        createPortal(
          <LoaderTopLayer
            $visible={loaderVisible}
            onTransitionEnd={onLoaderTransitionEnd}
          >
            <StakanLoader
              wordmarkSrc={wordmark}
              subtitle="Подготавливаю сцену…"
              stopAt={96}
              totalDuration={4000}
            />
          </LoaderTopLayer>,
          document.body
        )}

      <StyledWrapper
        ref={wrapperRef}
        className={contentVisible ? "visible" : ""}
      >
        <HeaderMemo timeLeft={timeLeft} duration={duration} />

        <Droplets onPop={handlePop} />

        <FooterMemo score={score} />

        {startModalOpen ? (
          <ModalLayout isOpen={startModalOpen} setIsOpen={setStartModalOpen}>
            <ModalWindow
              header={failure?.name ?? "СБОЙ"}
              text={
                startMessage ??
                "Участвуй в сбое: у тебя 60 секунд, чтобы набрать как можно больше очков."
              }
              btnContent={
                failure?.is_active && !hasFinished ? (
                  <span>Начать!</span>
                ) : (
                  <span>Закрыть</span>
                )
              }
              setOpenModal={(value) => setStartModalOpen(value)}
              isOpenModal={startModalOpen}
              onAction={
                failure?.is_active && !hasFinished
                  ? handleStartGame
                  : () => setStartModalOpen(false)
              }
              isActionLoading={isStarting}
            />
          </ModalLayout>
        ) : null}

        {resultModalOpen ? (
          <ModalLayout
            isOpen={resultModalOpen}
            setIsOpen={setResultModalOpen}
          >
            <ModalWindow
              header="Результат сбоя"
              text={resultMessage ?? `Вы набрали ${score} очков.`}
              btnContent={<span>Закрыть</span>}
              setOpenModal={(value) => setResultModalOpen(value)}
              isOpenModal={resultModalOpen}
              onAction={() => setResultModalOpen(false)}
            />
          </ModalLayout>
        ) : null}
      </StyledWrapper>
    </>
  );
}
