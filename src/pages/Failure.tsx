import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";

/** загрузочный экран */
import StakanLoader from "../shared/components/stakan/StakanLoader";
import { createPortal } from "react-dom";
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

const HeaderMemo: React.FC<{ startTimer: boolean }> = React.memo(
  ({ startTimer }) => (
    <StyledHeaderWrapper>
      <FailrueHeader startTimer={startTimer} />
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
  const [score, setScore] = useState(0);

  // Покадровый сценарий загрузки
  const [contentVisible, setContentVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true); // видимость (фейд)
  const [showLoaderNode, setShowLoaderNode] = useState(true); // наличие узла портала
  const [startHeaderTimer, setStartHeaderTimer] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // стабильный колбэк: не дёргает поддерево на каждый клик
  const handlePop = useCallback(() => setScore((s) => s + 1), []);

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
      await sleep(180);
      setStartHeaderTimer(true);
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

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
        <HeaderMemo startTimer={startHeaderTimer} />

        <Droplets onPop={handlePop} />

        <FooterMemo score={score} />
      </StyledWrapper>
    </>
  );
}
