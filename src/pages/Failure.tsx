import React, { useEffect, useState } from "react";
import styled from "styled-components";
import FailrueHeader from "../components/failure/header/FailrueHeader";
import Droplets from "../components/failure/droplets/Droplets";
import FailureFooter from "../components/failure/footer/FailureFooter";

/** наш загрузочный экран */
import StakanLoader from "../components/loader/StakanLoader";
import wordmark from "../assets/coin1.png";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
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

/* ====================== Основной компонент ====================== */

export default function Failure() {
  const [score, setScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Дожидаемся, когда все ресурсы страницы загрузятся (изображения, css, и т.п.)
    const handleLoad = () => setIsLoaded(true);

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <>
      {!isLoaded && (
        <StakanLoader
          wordmarkSrc={wordmark}
          subtitle="Подготавливаю сцену..."
          totalDuration={2500}
          stopAt={95}
        />
      )}

      <StyledWrapper style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
        <StyledHeaderWrapper>
          <FailrueHeader />
        </StyledHeaderWrapper>

        <Droplets onPop={() => setScore((s) => s + 1)} />

        <StyledFooterWrapper>
          <FailureFooter score={score} />
        </StyledFooterWrapper>
      </StyledWrapper>
    </>
  );
}
