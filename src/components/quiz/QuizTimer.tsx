import React from "react";
import styled from "styled-components";

const TimerWrapper = styled.div`
  width: 90%;
  margin: 0 auto 8px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
`;

const BarOuter = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  overflow: hidden;
`;

const BarInner = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #40ffdf, #2cc2a9);
  width: ${({ $progress }) => $progress}%;
  transition: width 1s linear;
`;

const TimeLabel = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 10px;
  color: #e0fffb;
  margin-left: 8px;
`;

interface QuizTimerProps {
  duration?: number; // общее время (сек), по умолчанию 20
  remaining?: number; // сколько осталось (сек)
}

export default function QuizTimer({
  duration = 20,
  remaining = 0,
}: QuizTimerProps) {
  const progress = Math.max(0, Math.min(100, (remaining / duration) * 100));
  return (
    <TimerWrapper>
      <BarOuter>
        <BarInner $progress={progress} />
      </BarOuter>
      <TimeLabel>{remaining.toString().padStart(2, "0")}s</TimeLabel>
    </TimerWrapper>
  );
}
