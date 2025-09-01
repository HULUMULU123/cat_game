import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 200px;
  height: 200px;
`;

const TimerText = styled.div`
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`;

const Svg = styled.svg`
  transform: rotate(-90deg); /* чтобы анимация шла по часовой */
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: #ddd;
  stroke-width: 12;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: #4caf50;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
`;

const CircleInner = styled.circle`
  fill: none;
  stroke: #aaa;
  stroke-width: 2;
`;

const TimerRing = ({ duration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const progress = (timeLeft / duration) * circumference;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Wrapper>
      <Svg width="200" height="200">
        <CircleBackground cx="100" cy="100" r={radius} />
        <CircleProgress
          cx="100"
          cy="100"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
        <CircleInner cx="100" cy="100" r={70} />
      </Svg>
      <TimerText>{formatTime(timeLeft)}</TimerText>
    </Wrapper>
  );
};

export default TimerRing;
