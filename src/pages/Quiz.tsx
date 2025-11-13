import React, { useState } from "react";
import CoinCount from "../components/common/CoinCount";
import SectionInfo from "../components/common/SectionInfo";
import styled from "styled-components";
import QuizPart from "../components/quiz/QuizPart";
import QuizInfo from "../components/quiz/QuizInfo";

const StyledWrapper = styled.div`
  height: 100vh;
  width: 100%;
  backdrop-filter: blur(40px);
`;

export default function Quiz() {
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 5,
  });

  const [timer, setTimer] = useState<{ remaining: number; total: number }>({
    remaining: 20,
    total: 20,
  });

  return (
    <StyledWrapper>
      <CoinCount />
      <SectionInfo
        InfoName={"НЕЙРОФИЛЬТР"}
        InfoExtra={`${progress.current+1} / ${progress.total}`}
      />
      <QuizPart
        onProgressChange={setProgress}
        onTimerChange={setTimer} // <- получаем оставшееся время на вопрос
      />
      <QuizInfo
        current={progress.current}
        total={progress.total}
        timer={timer} // <- отрисовываем визуальный таймер тут
      />
    </StyledWrapper>
  );
}
