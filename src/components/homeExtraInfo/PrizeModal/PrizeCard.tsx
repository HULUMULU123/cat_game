import React from 'react'
import styled from 'styled-components'
import prize_photo from '../../../assets/prize-photo.png'

const StyledPrizeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 250px;
  border-radius: 7px;
`

const StyledPrizeImg = styled.img`
  height: 100%;
  margin: auto;
`

const StyledTimerInfo = styled.div`
  position: absolute;
  width: 80%;
  background: #fff;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #1A9480;
`

const StyledTextSpan = styled.span`
margin: 0 auto;
font-size: 10px;
font-weight: 500;
`

const StyledTimerSpan = styled.span`
margin: 0 auto;
font-size: 21px;
font-weight: 700;`

export default function PirzeCard() {
  return (
    <StyledPrizeWrapper>
      <StyledPrizeImg src={prize_photo}/>
      <StyledTimerInfo>
        <StyledTextSpan>СБОЙ НАЧНЕТСЯ ЧЕРЕЗ</StyledTextSpan>
        <StyledTimerSpan>02 : 16 : 58</StyledTimerSpan>
      </StyledTimerInfo>
    </StyledPrizeWrapper>
  )
}
