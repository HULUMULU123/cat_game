import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";

/** загрузочный экран */
import StakanLoader from "../components/loader/StakanLoader";
import { createPortal } from "react-dom";
import wordmark from "../assets/coin1.png";

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
  transition: opacity 0.6s ease; /* плавное проявление контента */
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
  transition: opacity 420ms ease; /* уходит чуть позже контента */
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
`;

/* ====================== Хелперы ожидания ====================== */

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitImages(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll("img")) as HTMLImageElement[];
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
    // страховка: если какая-то картинка «висит»
    sleep(2500),
  ]);
}

async function waitVideosMeta(container: HTMLElement) {
  const vids = Array.from(container.querySelectorAll("video")) as HTMLVideoElement[];
  const pending = vids.filter((v) => v.readyState < 2); // metadata+enough to play
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
  // Font Loading API (может не быть в старых WebView — поэтому с try/catch)
  try {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await Promise.race([document.fonts.ready, sleep(1500)]);
    }
  } catch {}
}

/**
 * Главный «стабилизатор»: ждём window.load (если нужно),
 * ассеты внутри контейнера, пару кадров и короткий буфер.
 */
async function ensureStableReady(container: HTMLElement) {
  if (document.readyState !== "complete") {
    await new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true }));
  }
  await waitFonts();
  await waitImages(container);
  await waitVideosMeta(container);
  await nextFrame();
  await nextFrame();
  await sleep(120); // маленький буфер
}

/* ====================== Страница ====================== */

export default function Failure() {
  const [score, setScore] = useState(0);

  // Состояния покадрового сценария загрузки
  const [contentVisible, setContentVisible] = useState(false); // фейд-ин контента
  const [loaderVisible, setLoaderVisible] = useState(true);    // кроссфейд лоадера
  const [startHeaderTimer, setStartHeaderTimer] = useState(false); // старт таймера в хедере

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const root = wrapperRef.current || document.body;

      // страховка: максимально 5 сек на любые «зависшие» ресурсы
      const watchdog = sleep(5000).then(() => {
        if (alive) console.warn("[Failure] Ready watchdog fired -> forcing show");
      });

      await Promise.race([ensureStableReady(root), watchdog]);

      if (!alive) return;

      // 1) показываем контент
      setContentVisible(true);

      // 2) небольшой сдвиг, чтобы контент успел отрисоваться под лоадером
      await sleep(220);

      // 3) скрываем лоадер
      setLoaderVisible(false);

      // 4) ещё немного — и запускаем таймер в хедере
      await sleep(180);
      setStartHeaderTimer(true);
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* Лоадер поверх всего через портал */}
      {createPortal(
        <LoaderTopLayer $visible={loaderVisible}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Подготавливаю сцену…"
            stopAt={96}
            totalDuration={4000}
          />
        </LoaderTopLayer>,
        document.body
      )}

      <StyledWrapper ref={wrapperRef} className={contentVisible ? "visible" : ""}>
        <StyledHeaderWrapper>
          {/* Хедер начнёт отсчёт только когда дадим флаг */}
          <FailrueHeader startTimer={startHeaderTimer} />
        </StyledHeaderWrapper>

        <Droplets onPop={() => setScore((s) => s + 1)} />

        <StyledFooterWrapper>
          <FailureFooter score={score} />
        </StyledFooterWrapper>
      </StyledWrapper>
    </>
  );
}
