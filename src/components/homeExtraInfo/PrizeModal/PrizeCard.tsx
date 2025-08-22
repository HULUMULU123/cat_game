import React from 'react'
import styled from 'styled-components'
import prize_photo from '../../../assets/prize-photo.png'

const StyledWrapper = styled.div`
  width: 95%;
  display: flex;
  margin: 15px auto;
  gap: 7px;
  flex-direction: column;
  align-items: center;
`


const StyledPrizeWrapper = styled.div`

  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 250px;
  border-radius: 7px;
  background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
`

const StyledPrizeImg = styled.img`
  height: 100%;
  margin: auto;
`

const StyledTimerInfo = styled.div`
  position: absolute;
  width: 60%;
  background: #fff;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #1A9480;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Conthrax', sans-serif;
  padding: 5px 0;
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

const StyledPrizeName = styled.span`
  font-family: 'Conthrax', sans-serif;
  font-size: 10px;
  color: rgb(116,145,140);
`

export default function PirzeCard() {
  return (<StyledWrapper>
    <StyledPrizeWrapper>
      <StyledPrizeImg src={prize_photo}/>
      <StyledTimerInfo>
        <StyledTextSpan>СБОЙ НАЧНЕТСЯ ЧЕРЕЗ</StyledTextSpan>
        <StyledTimerSpan>02 : 16 : 58</StyledTimerSpan>
      </StyledTimerInfo>
    </StyledPrizeWrapper>
    </StyledWrapper>
  )
}
