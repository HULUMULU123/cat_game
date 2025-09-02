import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import drop1 from "../../../assets/drops/drop1.svg";
import drop2 from "../../../assets/drops/drop2.svg";
import drop3 from "../../../assets/drops/drop3.svg";
import drop4 from "../../../assets/drops/drop3.svg";
import drop5 from "../../../assets/drops/drop4.svg";

/**
 * Исправления:
 * - надёжный клик с первого раза: используем onPointerDown, hit-test только по обёртке
 * - не анимируем top + transform одновременно; только transform (плавнее и клики стабильно)
 * - аккуратно считаем позицию вспышки через rect относительно Wrapper (без scrollY)
 * - не мутируем объекты в state для ref; используем Map(id -> HTMLElement)
 * - выключаем выделение/перетаскивание/хайлайт на мобильных
 */

const StyledWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

// Падение с ускорением (ease-in) на дистанцию distance
const fall = (distance: number) => keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(${distance}px); }
`;

// Контейнер с увеличенным хитбоксом. Параметр pad — дополнительный паддинг хитбокса.
const DropletWrapper = styled.div<{
  x: number;
  size: number;
  duration: number;
  start: number;
  pad: number;
  distance: number;
}>`
  position: absolute;
  left: ${({ x, pad }) => x - pad}px;
  top: ${({ start, pad }) => start - pad}px;
  width: ${({ size, pad }) => size + pad * 2}px;
  height: ${({ size, pad }) => size + pad * 2}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  touch-action: none; /* без скроллов-жестов поверх */
  -webkit-tap-highlight-color: transparent;
  will-change: transform;
  animation: ${({ distance }) => fall(distance)}
    ${({ duration }) => duration}ms ease-in forwards;
    background: red;
`;

// Капля как картинка — клики через неё не ловим, чтобы всё шло в обёртку
const DropletImg = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
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
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;

const dropletSvgs = [drop1, drop2, drop3, drop4, drop5];

interface DropModel {
  id: number;
  x: number;
  size: number;
  svg: string;
  duration: number;
  start: number; // начальный top (обычно -size)
  distance: number; // сколько пройти по Y трансформом
}

const Droplets = ({
  spawnInterval = 800,
  hitboxPadding = 20, // увеличенный хитбокс
}: {
  spawnInterval?: number;
  hitboxPadding?: number;
}) => {
  const [drops, setDrops] = useState<DropModel[]>([]);
  const [pops, setPops] = useState<any[]>([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropletRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const timer = setInterval(() => {
      const id = Date.now() + Math.random();
      const size = Math.random() * 40 + 20;
      const x = Math.random() * (window.innerWidth - size);
      const duration = Math.random() * 1800 + 1800;
      const start = -size;
      const distance = window.innerHeight + 50 - start;
      const svg = dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      setDrops((prev) => [
        ...prev,
        { id, x, size, svg, duration, start, distance },
      ]);

      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
        dropletRefs.current.delete(id);
      }, duration);
    }, Math.max(10, spawnInterval / 3));

    return () => clearInterval(timer);
  }, [spawnInterval]);

  const handlePop = (drop: DropModel) => {
    const el = dropletRefs.current.get(drop.id);
    const wrapper = wrapperRef.current;

    setDrops((prev) => prev.filter((d) => d.id !== drop.id));
    dropletRefs.current.delete(drop.id);

    if (el && wrapper) {
      const rect = el.getBoundingClientRect();
      const wrapRect = wrapper.getBoundingClientRect();
      const x = rect.left - wrapRect.left + hitboxPadding + drop.size / 2;
      const y = rect.top - wrapRect.top + hitboxPadding + drop.size / 2;

      const popId = drop.id + 0.123;
      setPops((prev) => [...prev, { id: popId, x, y, size: drop.size }]);
      setTimeout(() => {
        setPops((prev) => prev.filter((p) => p.id !== popId));
      }, 600);
    }
  };

  return (
    <StyledWrapper>
      <Wrapper ref={wrapperRef}>
        {drops.map((drop) => (
          <DropletWrapper
            key={drop.id}
            ref={(el) => {
              if (el) dropletRefs.current.set(drop.id, el);
              else dropletRefs.current.delete(drop.id);
            }}
            x={drop.x}
            size={drop.size}
            duration={drop.duration}
            start={drop.start}
            pad={hitboxPadding}
            distance={drop.distance}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId); // улучшение отзывчивости
              handlePop(drop);
            }}
          >
            <DropletImg src={drop.svg} size={drop.size} draggable={false} />
          </DropletWrapper>
        ))}

        {pops.map((pop) => (
          <PopEffect key={pop.id} x={pop.x} y={pop.y} size={pop.size} />
        ))}
      </Wrapper>
    </StyledWrapper>
  );
};
