import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";

const StyledModalLayout = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1000000;
  backdrop-filter: blur(0px);
  background: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: backdrop-filter 0.4s ease, background 0.4s ease;

  &.open {
    backdrop-filter: blur(5px);
    background: rgba(0, 0, 0, 0.3);
  }
`;

interface ModalLayoutProps {
  children: ReactNode;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const ModalLayout = ({ children, isOpen, setIsOpen }: ModalLayoutProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => setAnimate(true), 50);
      return () => window.clearTimeout(timer);
    }

    setAnimate(false);
    return undefined;
  }, [isOpen]);

  return (
    <StyledModalLayout
      className={animate ? "open" : ""}
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      {children}
    </StyledModalLayout>
  );
};

export default ModalLayout;
