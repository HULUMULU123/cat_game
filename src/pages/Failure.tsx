import React, { useEffect, useState } from "react";
import styled from "styled-components";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";

/** загрузочный экран */
import StakanLoader from "../components/loader/StakanLoader";
import { createPortal } from "react-dom";
import wordmark from "../assets/coin1.png";

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
  transition: opacity 420ms ease; /* лоадер уходит чуть позже контента */
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
`;

/* ====================== Основной компонент ====================== */

export default function Failure() {
  const [score, setScore] = useState(0);

  // Состояния покадрового сценария загрузки
  const [pageReady, setPageReady] = useState(false);        // window 'load' произошёл
  const [contentVisible, setContentVisible] = useState(false); // включаем фейд-ин контента
  const [loaderVisible, setLoaderVisible] = useState(true); // анимация скрытия лоадера
  const [startHeaderTimer, setStartHeaderTimer] = useState(false); // триггер старта таймера в хедере

  useEffect(() => {
    const onLoad = () => setPageReady(true);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!pageReady) return;
    // 1) небольшая задержка перед показом контента
    const t1 = setTimeout(() => setContentVisible(true), 150);
    // 2) ещё чуть-чуть — и начинаем убирать лоадер кроссфейдом
    const t2 = setTimeout(() => setLoaderVisible(false), 350);
    // 3) запускаем таймер в хедере уже ПОСЛЕ кроссфейда лоадера
    const t3 = setTimeout(() => setStartHeaderTimer(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pageReady]);

  return (
    <>
      {/* Лоадер поверх всего через портал */}
      {createPortal(
        <LoaderTopLayer $visible={loaderVisible}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Подготавливаю сцену…"
            totalDuration={3000}
            stopAt={96}           // визуально зависаем около 96%, пока страница готовится
          />
        </LoaderTopLayer>,
        document.body
      )}

      <StyledWrapper className={contentVisible ? "visible" : ""}>
        <StyledHeaderWrapper>
          {/* Передаём флаг старта таймера. Внутри FailrueHeader проверь и запускай таймер при true */}
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

