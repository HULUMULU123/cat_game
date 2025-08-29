import React from 'react'
import styled from 'styled-components'
import white_prize from '../../assets/icons/white_prize.svg'
const StyledItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    width: 90%;
`

const NumberWrapper = styled.div`
display: flex;
align-items: center;
gap: 5px;`

const NumberSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 800;
color: #fff;`

const PrizeImg = styled.img`
width: 19px;
height: 19px;`

const NicknameSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 800;
color: #fff;`

const TimeSpan = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 12px;
font-weight: 300;
color: #fff;`

const ScoreSpan = styled.span`font-family: 'Conthrax', sans-serif;
font-size: 10px;
font-weight: 800;
color: #fff;`
export default function UsersItem() {
  return (
    <StyledItem>
      <NumberWrapper>
        <PrizeImg src={white_prize}/>
        <NumberSpan>1</NumberSpan>
      </NumberWrapper>
      <NicknameSpan>Alex</NicknameSpan>
      <TimeSpan>12 : 12 : 12</TimeSpan>
      <ScoreSpan>5 400</ScoreSpan>
    </StyledItem>
  )
}
