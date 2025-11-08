import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 133px;   /* фиксированный контейнер */
  height: 133px;
`;

const TimerText = styled.div`
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
  position: absolute;
  font-size: 19px; /* 16 * 1.2 */
  color: var(--color-white-text);
`;

const Svg = styled.svg`
  transform: rotate(-90deg); 
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: transparent;
  stroke-width: 10; /* 8 * 1.2 */
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: url(#timerGradient);
  stroke-width: 10;
  stroke-linecap: butt;
  transition: stroke-dashoffset 1s linear;
`;

const CircleInner = styled.circle`
  fill: none;
  stroke: #85FFF0;
  stroke-width: 2.4; /* 2 * 1.2 */
`;

interface TimerRingProps {
  duration: number;
  timeLeft: number;
}

const TimerRing = ({ duration, timeLeft }: TimerRingProps) => {
  const safeDuration = duration > 0 ? duration : 1;
  const clampedTime = Math.max(0, Math.min(timeLeft, safeDuration));
  const radius = 48; // 40 * 1.2
  const circumference = 2 * Math.PI * radius;

  const progress = (clampedTime / safeDuration) * circumference;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(1, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Wrapper>
      <Svg width="133" height="133">
        <defs>
          <linearGradient id="timerGradient" gradientTransform="rotate(224)">
            <stop offset="0%" stopColor="rgba(31, 255, 227, 0.56)" />
            <stop offset="100%" stopColor="rgba(0, 223, 152, 0.82)" />
          </linearGradient>
        </defs>

        <CircleBackground cx="66.5" cy="66.5" r={radius} />
        <CircleProgress
          cx="66.5"
          cy="66.5"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
        <CircleInner cx="66.5" cy="66.5" r={36} /> {/* 30 * 1.2 */}
      </Svg>
      <TimerText>{formatTime(clampedTime)}</TimerText>
    </Wrapper>
  );
};

export default TimerRing;
