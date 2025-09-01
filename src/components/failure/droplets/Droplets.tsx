import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSpring, animated, useTransition } from "react-spring";
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

const Droplet = styled(animated.img)`
  position: absolute;
  cursor: pointer;
  user-select: none;
`;

const PopEffect = styled(animated.div)`
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
      const id = Date.now() + Math.random();
      const size = Math.random() * 40 + 20;
      const x = Math.random() * (window.innerWidth - size);
      const speed = Math.random() * 4000 + 4000; // ms
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
    setPops((prev) => [...prev, { id: `${id}-pop`, x, y, size }]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== `${id}-pop`));
    }, 600);
  };

  const dropTransitions = useTransition(drops, {
    keys: (drop) => drop.id,
    from: (drop) => ({ top: -drop.size, left: drop.x, opacity: 1, transform: `scale(${drop.size / 40})` }),
    enter: (drop) => ({ top: window.innerHeight + drop.size }),
    leave: { opacity: 0 },
    config: (drop) => ({ duration: drop.speed }),
  });

  const popTransitions = useTransition(pops, {
    keys: (pop) => pop.id,
    from: (pop) => ({
      left: pop.x,
      top: pop.y,
      width: 0,
      height: 0,
      background: "rgba(0, 223, 152, 0.5)",
      opacity: 1,
      marginLeft: 0,
      marginTop: 0,
    }),
    enter: (pop) => ({
      width: pop.size * 2,
      height: pop.size * 2,
      marginLeft: -pop.size,
      marginTop: -pop.size,
      opacity: 0,
    }),
    leave: {},
    config: { duration: 600 },
  });

  return (
    <Wrapper>
      {dropTransitions((style, drop) => (
        <Droplet
          key={drop.id}
          src={drop.svg}
          style={style}
          onClick={(e) => handlePop(drop.id, drop.x, e.clientY, drop.size)}
        />
      ))}

      {popTransitions((style, pop) => (
        <PopEffect key={pop.id} style={style} />
      ))}
    </Wrapper>
  );
};

export default Droplets;
