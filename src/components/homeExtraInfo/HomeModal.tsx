import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PrizeModal from './PrizeModal/PrizeModal'

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
  align-items: start;

  transition: backdrop-filter 0.4s ease, background 0.4s ease;

  &.open {
    backdrop-filter: blur(20px);
    background: rgba(0,0,0,0.3);
  }
`

export default function HomeModal({infoType, isOpen, handleClose}) {
    const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimate(true), 50) // маленькая задержка
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
    console.log(isOpen, infoType)
  }, [isOpen])
  return (
    <StyledModalLayout className={animate ? "open" : ""} onClick={handleClose}>
      <div style={{display:'flex', justifyContent:'center'}} onClick={(e) => e.stopPropagation()}>
        {infoType == 'prize' ? <PrizeModal handleClose={handleClose}/> : null}
      </div>
    </StyledModalLayout>
  )
}
