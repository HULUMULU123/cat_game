import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import cancel from '../../assets/icons/cancel.svg'
const StyledModalWidnow = styled.div`
  margin: auto;
  display: flex;
  position: relative;
  width: 75%;
  padding: 20px 0;
  background: #28B092;
  border-radius: 7px;

  transform: translateY(100px);
  opacity: 0;
  transition: all 0.4s ease;

  &.open {
    transform: translateY(0);
    opacity: 1;
  }
`

const StyledContentWrapper = styled.div`
margin: auto;
width: 90%;
display: flex;
flex-direction: column;`

const StyledHeader = styled.h3`
font-family: 'Conthrax', sans-serif;
font-size: 15px;
color: var(--color-white-text);
text-align: center;
font-weight: 700;
`

const StyledLine = styled.span`
display: block;
height: 3px;
width: 100%;
background: #85FFF0;
margin-top: 10px;

`

const StyledText = styled.p`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
color: var(--color-white-text);
text-align: center;
font-weight: 500;
margin-top: 15px;
`


const StyledBtnSpan = styled.span`
`

const StyledBtn = styled.button`
background: #fff;
width: 60%;
margin: 0 auto;
margin-top: 20px;
border-radius: 7px;`

const StyledCloseBtn = styled.button`
position: absolute;
top: 5px;
right: 5px;
width: 22px;
height: 22px;
display: flex;
border: none;
background: transparent;
align-items: center;`

const StyledCloseBtnImg = styled.img`
width: 100%;
height: 100%;
margin: auto;
`

const StyledMainText = styled.span``
export default function ModalWindow({header, text, btnContent=null, mainText=null, setOpenModal, isOpenModal}) {
    const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpenModal) {
      const timer = setTimeout(() => setAnimate(true), 50) // маленькая задержка
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isOpenModal])
  return (
    <StyledModalWidnow className={animate ? "open" : ""}>
        <StyledCloseBtn onClick={()=>setOpenModal(false)}><StyledCloseBtnImg src={cancel}></StyledCloseBtnImg></StyledCloseBtn>
        <StyledContentWrapper>
            <StyledHeader>{header}</StyledHeader>
            <StyledLine></StyledLine>
            <StyledText>{text}</StyledText>
            {btnContent ? <StyledBtn> {btnContent} </StyledBtn>: null}
            {mainText ? <StyledMainText></StyledMainText> : null}
        </StyledContentWrapper>
    </StyledModalWidnow>
  )
}
