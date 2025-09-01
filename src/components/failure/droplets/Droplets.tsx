import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import drop1 from '../../../assets/drops/drop1.svg'
import drop2 from '../../../assets/drops/drop2.svg'
import drop3 from '../../../assets/drops/drop3.svg'
import drop4 from '../../../assets/drops/drop3.svg'
import drop5 from '../../../assets/drops/drop4.svg'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Droplet = styled(motion.img)`
  position: absolute;
  cursor: pointer;
  user-select: none;
`;

const PopEffect = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
`;

const dropletSvgs = [drop1, drop2, drop3, drop4, drop5];

const Droplets = ({ spawnInterval = 800 }) => {
  const [drops, setDrops] = useState([]);
  const [pops, setPops] = useState([]);

  useEffect(() => {
    const spawn = setInterval(() => {
      const id = Date.now() + Math.random(); // уникальный id
      const size = Math.random() * 40 + 20; // 20–60px
      const x = Math.random() * (window.innerWidth - size);
      const speed = Math.random() * 4 + 4; // 4–8s падение
      const svg = dropletSvgs[Math.floor(Math.random() * dropletSvgs.length)];

      setDrops((prev) => [
        ...prev,
        { id, x, size, speed, svg }
      ]);
    }, spawnInterval);

    return () => clearInterval(spawn);
  }, [spawnInterval]);

  const handlePop = (id, x, y, size) => {
    setDrops((prev) => prev.filter((drop) => drop.id !== id));
    setPops((prev) => [
      ...prev,
      { id: `${id}-pop`, x, y, size }
    ]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== `${id}-pop`));
    }, 600);
  };

  return (
    <Wrapper>
      <AnimatePresence>
        {drops.map((drop) => (
          <Droplet
            key={drop.id}
            src={drop.svg}
            initial={{ y: -drop.size, x: drop.x, opacity: 1, scale: drop.size / 40 }}
            animate={{ y: window.innerHeight + drop.size }}
            exit={{ opacity: 0 }}
            transition={{ duration: drop.speed, ease: "linear" }}
            style={{ width: drop.size, height: drop.size }}
            onClick={(e) =>
              handlePop(drop.id, drop.x, e.clientY, drop.size)
            }
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {pops.map((pop) => (
          <PopEffect
            key={pop.id}
            initial={{
              left: pop.x,
              top: pop.y,
              width: 0,
              height: 0,
              background: "rgba(0, 223, 152, 0.5)",
              opacity: 1,
            }}
            animate={{
              width: pop.size * 2,
              height: pop.size * 2,
              marginLeft: -pop.size,
              marginTop: -pop.size,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </Wrapper>
  );
};

export default Droplets;
