import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledModalLayout = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height:100vh;
  z-index: 1000000;

  backdrop-filter: blur(0px);
  background: rgba(0,0,0,0);

  display: flex;
  justify-content: center;
  align-items: center;

  transition: backdrop-filter 0.4s ease, background 0.4s ease;

  &.open {
    backdrop-filter: blur(5px);
    background: rgba(0,0,0,0.3);
  }
`

export default function ModalLayout({children, isOpen, setIsOpen}) {
    const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimate(true), 50) // маленькая задержка
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isOpen])
  return (
    <StyledModalLayout className={animate ? "open" : ""} onClick={()=>setIsOpen(false)}>{children}</StyledModalLayout>
  )
}
