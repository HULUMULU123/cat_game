import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import drop1 from "../../../assets/drops/drop1.svg";
import drop2 from "../../../assets/drops/drop2.svg";
import drop3 from "../../../assets/drops/drop3.svg";
import drop4 from "../../../assets/drops/drop3.svg";
import drop5 from "../../../assets/drops/drop4.svg";

const StyledWrapper = styled.div`
  position: absolute;
  z-index: 0;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
`;

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

// анимация падения с ускорением
const fall = (start: number, end: number) => keyframes`
  from { top: ${start}px; transform: translateY(0); animation-timing-function: ease-in; }
  to { top: ${end}px; transform: translateY(${end - start}px); }
`;

// контейнер с увеличенным хитбоксом
const DropletWrapper = styled.div<{
  x: number;
  size: number;
  duration: number;
  start: number;
}>`
  position: absolute;
  left: ${({ x }) => x - 10}px; /* расширяем хитбокс */
  top: ${({ start }) => start - 10}px;
  width: ${({ size }) => size + 20}px;
  height: ${({ size }) => size + 20}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  animation: ${({ start, duration }) => fall(start, window.innerHeight + 50)}
    ${({ duration }) => duration}ms ease-in forwards;
`;

// сама капля
const DropletImg = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  pointer-events: none; /* чтобы клики шли по обертке */
`;

const PopEffect = styled.div<{ x: number; y: number; size: number }>`
  position: absolute;
  left: ${({ x, size }) => x - size / 2}px;
  top: ${({ y, size }) => y - size / 2}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: rgba(0, 223, 152, 0.5);
  border-radius: 50%;
  pointer-events: none;
  animation: pop 0.6s forwards;

  @keyframes pop {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
`;

const dropletSvgs = [drop1, drop2, drop3, drop4, drop5];

const Droplets = ({ spawnInterval = 800 }) => {
  const [drops, setDrops] = useState<any[]>([]);
  const [pops, setPops] = useState<any[]>([]);

  useEffect(() => {
    const spawn = setInterval(() => {
      const id = Date.now() + Math.random();
      const size = Math.random() * 40 + 20;
      const x = Math.random() * (window.innerWidth - size);
      const speed = Math.random() * 1800 + 1800; // 0.8–1.6 секунд
      const svg = dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      setDrops((prev) => [...prev, { id, x, size, svg, speed, start: -size }]);

      // удалить каплю через duration
      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, speed);
    }, spawnInterval / 3);

    return () => clearInterval(spawn);
  }, [spawnInterval]);

  const handlePop = (drop) => {
    setDrops((prev) => prev.filter((d) => d.id !== drop.id));
    const popId = `${drop.id}-pop`;
    setPops((prev) => [
      ...prev,
      {
        id: popId,
        x: drop.x + drop.size / 2,
        y: window.scrollY + (drop.ref?.getBoundingClientRect().top ?? 0) + drop.size / 2,
        size: drop.size + 20, // эффект под размер хитбокса
      },
    ]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== popId));
    }, 600);
  };

  return (
    <StyledWrapper>
      <Wrapper>
        {drops.map((drop) => (
          <DropletWrapper
            key={drop.id}
            x={drop.x}
            size={drop.size}
            duration={drop.speed}
            start={drop.start}
            ref={(el) => (drop.ref = el)}
            onClick={() => handlePop(drop)}
          >
            <DropletImg src={drop.svg} size={drop.size} />
          </DropletWrapper>
        ))}
        {pops.map((pop) => (
          <PopEffect key={pop.id} x={pop.x} y={pop.y} size={pop.size} />
        ))}
      </Wrapper>
    </StyledWrapper>
  );
};

export default Droplets;
