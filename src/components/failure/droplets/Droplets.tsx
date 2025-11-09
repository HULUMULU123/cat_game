import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import drop1 from "../../../assets/drops/drop1.svg";
import drop2 from "../../../assets/drops/drop2.svg";
import drop3 from "../../../assets/drops/drop3.svg";
import drop4 from "../../../assets/drops/drop3.svg";
import drop5 from "../../../assets/drops/drop4.svg";
import bombDrop from "../../../assets/drops/bomb.svg";

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

const fall = (distance: number) => keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(${distance}px); }
`;

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
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  will-change: transform;
  animation: ${({ distance }) => fall(distance)}
    ${({ duration }) => duration}ms ease-in forwards;
`;

const DropletImg = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;

const PopEffect = styled.div<{
  x: number;
  y: number;
  size: number;
  color: string;
}>`
  position: absolute;
  left: ${({ x, size }) => x - size / 2}px;
  top: ${({ y, size }) => y - size / 2}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  animation: pop 0.6s forwards;

  @keyframes pop {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;

const dropletSvgs = [drop1, drop2, drop3, drop4, drop5];

type DropKind = "water" | "bomb";

interface DropModel {
  id: number;
  x: number;
  size: number;
  svg: string;
  duration: number;
  start: number;
  distance: number;
  kind: DropKind;
}

interface DropletsProps {
  spawnInterval?: number;
  hitboxPadding?: number;
  onPop?: () => void; // 👈 функция из родителя
  onBomb?: () => void;
  speedModifier?: number;
  bombSchedule?: number[];
  disableBombs?: boolean;
  bombEffectColor?: string;
}

const Droplets = ({
  spawnInterval = 500,
  hitboxPadding = 20,
  onPop,
  onBomb,
  speedModifier = 1,
  bombSchedule,
  disableBombs = false,
  bombEffectColor = "rgba(220, 80, 80, 0.6)",
}: DropletsProps) => {
  const [drops, setDrops] = useState<DropModel[]>([]);
  const [pops, setPops] = useState<
    { id: number; x: number; y: number; size: number; color: string }
  >([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropletRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const bombTimeoutsRef = useRef<number[]>([]);

  const normalizedSpeed = useMemo(() => Math.max(0.5, speedModifier || 1), [
    speedModifier,
  ]);

  const createDrop = useCallback(
    (kind: DropKind) => {
      const id = Date.now() + Math.random();
      const size = Math.random() * 40 + 20;
      const x = Math.random() * (window.innerWidth - size);
      const start = -size;
      const distance = window.innerHeight + 50 - start;
      const baseDuration = Math.random() * 1800 + 1800;
      const duration = Math.max(800, baseDuration * normalizedSpeed);
      const svg =
        kind === "bomb"
          ? bombDrop
          : dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      setDrops((prev) => [
        ...prev,
        { id, x, size, svg, duration, start, distance, kind },
      ]);

      const removeDrop = () => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
        dropletRefs.current.delete(id);
      };

      const animationTimeout = window.setTimeout(removeDrop, duration);

      const checkVisibility = () => {
        const el = dropletRefs.current.get(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          window.clearTimeout(animationTimeout);
          removeDrop();
        } else {
          requestAnimationFrame(checkVisibility);
        }
      };
      requestAnimationFrame(checkVisibility);
    },
    [normalizedSpeed]
  );

  useEffect(() => {
    const interval = Math.max(10, (spawnInterval / 3) * normalizedSpeed);
    const timer = window.setInterval(() => {
      createDrop("water");
    }, interval);

    return () => window.clearInterval(timer);
  }, [createDrop, normalizedSpeed, spawnInterval]);

  useEffect(() => {
    bombTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    bombTimeoutsRef.current = [];

    if (!bombSchedule || disableBombs) return;

    bombSchedule.forEach((delay) => {
      const safeDelay = Math.max(0, delay);
      const timeoutId = window.setTimeout(() => {
        createDrop("bomb");
      }, safeDelay);
      bombTimeoutsRef.current.push(timeoutId);
    });

    return () => {
      bombTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      bombTimeoutsRef.current = [];
    };
  }, [bombSchedule, createDrop, disableBombs]);

  useEffect(() => {
    if (!disableBombs) return;
    setDrops((prev) => prev.filter((drop) => drop.kind !== "bomb"));
  }, [disableBombs]);

  const handlePop = (drop: DropModel) => {
    const el = dropletRefs.current.get(drop.id);
    const wrapper = wrapperRef.current;

    setDrops((prev) => prev.filter((d) => d.id !== drop.id));
    dropletRefs.current.delete(drop.id);

    if (drop.kind === "bomb") {
      if (onBomb) onBomb();
    } else if (onPop) {
      onPop();
    }

    if (el && wrapper) {
      const rect = el.getBoundingClientRect();
      const wrapRect = wrapper.getBoundingClientRect();
      const x = rect.left - wrapRect.left + hitboxPadding + drop.size / 2;
      const y = rect.top - wrapRect.top + hitboxPadding + drop.size / 2;

      const popId = drop.id + 0.123;
      const color = drop.kind === "bomb" ? bombEffectColor : "rgba(0, 223, 152, 0.5)";
      setPops((prev) => [...prev, { id: popId, x, y, size: drop.size, color }]);
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
              e.currentTarget.setPointerCapture(e.pointerId);
              handlePop(drop);
            }}
          >
            <DropletImg src={drop.svg} size={drop.size} draggable={false} />
          </DropletWrapper>
        ))}

        {pops.map((pop) => (
          <PopEffect
            key={pop.id}
            x={pop.x}
            y={pop.y}
            size={pop.size}
            color={pop.color}
          />
        ))}
      </Wrapper>
    </StyledWrapper>
  );
};

export default Droplets;
