import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import drop1 from "../../../assets/drops/drop1.svg";
import drop2 from "../../../assets/drops/drop2.svg";
import drop3 from "../../../assets/drops/drop3.svg";
import drop4 from "../../../assets/drops/drop3.svg";
import drop5 from "../../../assets/drops/drop4.svg";
import bombDrop from "../../../assets/drops/bomb.svg";
import useQualityProfile from "../../../shared/hooks/useQualityProfile";

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

const fall = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, var(--fall-distance, 110vh), 0);
  }
`;

const DropletWrapper = styled.div<{
  x: number;
  size: number;
  duration: number;
  start: number;
  pad: number;
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
  animation-name: ${fall};
  animation-duration: ${({ duration }) => duration}ms;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
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
  duration: number;
}>`
  position: absolute;
  left: ${({ x, size }) => x - size / 2}px;
  top: ${({ y, size }) => y - size / 2}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  animation: pop ${({ duration }) => duration}ms forwards;

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

  const {
    settings: { droplets: dropletQuality },
  } = useQualityProfile();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropletRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const bombTimeoutsRef = useRef<number[]>([]);
  const viewportRef = useRef({ width: 0, height: 0 });

  const normalizedSpeed = useMemo(() => Math.max(0.5, speedModifier || 1), [
    speedModifier,
  ]);
  const bombsDisabled = disableBombs || dropletQuality.disableBombs;
  const popDuration = dropletQuality.popDuration;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      viewportRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const removeDrop = useCallback((id: number) => {
    setDrops((prev) => prev.filter((d) => d.id !== id));
    dropletRefs.current.delete(id);
  }, []);

  const createDrop = useCallback(
    (kind: DropKind) => {
      const id = Date.now() + Math.random();
      const size = Math.random() * 40 + 20;
      const { width, height } = viewportRef.current;
      const safeWidth = width || (typeof window !== "undefined" ? window.innerWidth : 0);
      const safeHeight = height || (typeof window !== "undefined" ? window.innerHeight : 0);
      const x = Math.random() * Math.max(0, safeWidth - size);
      const start = -size;
      const distance = safeHeight + 50 - start;
      const baseDuration = Math.random() * 1800 + 1800;
      const duration = Math.max(800, baseDuration * normalizedSpeed);
      const svg =
        kind === "bomb"
          ? bombDrop
          : dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      setDrops((prev) => {
        const next = [
          ...prev,
          { id, x, size, svg, duration, start, distance, kind },
        ];

        if (next.length <= dropletQuality.maxDrops) {
          return next;
        }

        const overflow = next.slice(0, next.length - dropletQuality.maxDrops);
        overflow.forEach((drop) => dropletRefs.current.delete(drop.id));

        return next.slice(next.length - dropletQuality.maxDrops);
      });
    },
    [dropletQuality.maxDrops, normalizedSpeed]
  );

  useEffect(() => {
    const interval = Math.max(
      10,
      (spawnInterval / 3) * normalizedSpeed * dropletQuality.spawnIntervalMultiplier
    );
    const timer = window.setInterval(() => {
      createDrop("water");
    }, interval);

    return () => window.clearInterval(timer);
  }, [
    createDrop,
    dropletQuality.spawnIntervalMultiplier,
    normalizedSpeed,
    spawnInterval,
  ]);

  useEffect(() => {
    bombTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    bombTimeoutsRef.current = [];

    if (!bombSchedule || bombsDisabled) return;

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
  }, [bombSchedule, bombsDisabled, createDrop]);

  useEffect(() => {
    if (!bombsDisabled) return;
    setDrops((prev) => {
      const next = prev.filter((drop) => {
        const keep = drop.kind !== "bomb";
        if (!keep) {
          dropletRefs.current.delete(drop.id);
        }
        return keep;
      });
      return next;
    });
  }, [bombsDisabled]);

  const handlePop = (drop: DropModel) => {
    const el = dropletRefs.current.get(drop.id);
    const wrapper = wrapperRef.current;

    removeDrop(drop.id);

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
      window.setTimeout(() => {
        setPops((prev) => prev.filter((p) => p.id !== popId));
      }, popDuration);
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
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handlePop(drop);
            }}
            onAnimationEnd={() => removeDrop(drop.id)}
            onAnimationCancel={() => removeDrop(drop.id)}
            style={
              {
                "--fall-distance": `${drop.distance}px`,
              } as React.CSSProperties
            }
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
            duration={popDuration}
          />
        ))}
      </Wrapper>
    </StyledWrapper>
  );
};

export default Droplets;
