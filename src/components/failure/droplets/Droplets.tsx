import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import drop1 from '../../../assets/drops/drop1.svg';
import drop2 from '../../../assets/drops/drop2.svg';
import drop3 from '../../../assets/drops/drop3.svg';
import drop4 from '../../../assets/drops/drop3.svg';
import drop5 from '../../../assets/drops/drop4.svg';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const DropletImg = styled.img<{ x: number; y: number; size: number }>`
  position: absolute;
  cursor: pointer;
  user-select: none;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transition: top ${({ size }) => size / 10}s linear;
`;

const PopEffect = styled.div<{ x: number; y: number; size: number }>`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  width: ${({ size }) => size * 2}px;
  height: ${({ size }) => size * 2}px;
  margin-left: ${({ size }) => -size}px;
  margin-top: ${({ size }) => -size}px;
  background: rgba(0, 223, 152, 0.5);
  opacity: 0;
  animation: pop 0.6s forwards;
  
  @keyframes pop {
    from { opacity: 1; transform: scale(0); }
    to { opacity: 0; transform: scale(1); }
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
      const speed = Math.random() * 4000 + 4000; // время падения в мс
      const svg = dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      const newDrop = { id, x, y: -size, size, speed, svg };
      setDrops((prev) => [...prev, newDrop]);

      // анимируем падение
      setTimeout(() => {
        setDrops((prev) =>
          prev.map((d) => (d.id === id ? { ...d, y: window.innerHeight + size } : d))
        );
      }, 50);

      // удаляем каплю после падения
      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, speed);
    }, spawnInterval);

    return () => clearInterval(spawn);
  }, [spawnInterval]);

  const handlePop = (id, x, y, size) => {
    setDrops((prev) => prev.filter((drop) => drop.id !== id));
    const popId = `${id}-pop`;
    setPops((prev) => [...prev, { id: popId, x, y, size }]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== popId));
    }, 600);
  };

  return (
    <Wrapper>
      <TransitionGroup>
        {drops.map((drop) => (
          <CSSTransition key={drop.id} timeout={drop.speed}>
            <DropletImg
              src={drop.svg}
              x={drop.x}
              y={drop.y}
              size={drop.size}
              onClick={(e) => handlePop(drop.id, drop.x, e.clientY, drop.size)}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>

      {pops.map((pop) => (
        <PopEffect key={pop.id} x={pop.x} y={pop.y} size={pop.size} />
      ))}
    </Wrapper>
  );
};

export default Droplets;
