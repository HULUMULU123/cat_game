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

  return (
    <StyledWrapper>
      <CoinCount />
      <SectionInfo
        InfoName={"НЕЙРОФИЛЬТР"}
        InfoExtra={`${progress.current} / ${progress.total}`}
      />
      <QuizPart onProgressChange={setProgress} />
      <QuizInfo current={progress.current} total={progress.total} />
    </StyledWrapper>
  );
}
