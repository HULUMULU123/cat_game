import React from 'react'
import styled from 'styled-components'
import cancel from '../../assets/icons/cancel.svg'
const StyledModalWidnow = styled.div`
margin: auto;
display: flex;
position: relative;
width: 50%;
padding: 20px 0;
background: #28B092;
border-radius: 7px;`

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
font-size: 112px;
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
top: 10px;
right: 10px;
width: 15px;
height: 15px;
display: flex;`

const StyledCloseBtnImg = styled.img`
width: 100%;
height: 100%;
margin: auto;
`

const StyledMainText = styled.span``
export default function ModalWindow({header, text, btnContent=null, mainText=null, setOpenModal}) {
  return (
    <StyledModalWidnow>
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
