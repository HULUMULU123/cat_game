import React from 'react'
import styled, { css } from 'styled-components'
import white_prize from '../../assets/icons/white_prize.svg'
import empty_prize from '../../assets/icons/empty_prize.svg'
const StyledItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  width: 95%;
  margin: 0 auto;
  border-radius:7px;
  background-color: ${({ number }) =>
    number === 1 ? css`background: #1FFFE3;
                        background: linear-gradient(90deg, rgba(31, 255, 227, 1) 0%, rgba(0, 223, 152, 1) 100%);` : 
                        number === 2 || number === 3 ? css`background: #1FFFE3;
                        background: linear-gradient(228deg, rgba(31, 255, 227, 0.8) 0%, rgba(0, 223, 152, 0.82) 100%);` : 
                        "transparent"};
`;


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

const getPrizeImg = (number) => {
    if (number === 1) return white_prize;
    if (number === 2 || number === 3) return empty_prize;
    return null; // ничего или прозрачный плейсхолдер
  };

  const getText = (number) => {
    if (number === 1) return number;
    if (number === 2 || number === 3) return number;
    return `#${number}`;
  };
export default function UsersItem({number}) {
  return (
    <StyledItem number={number}>
      <NumberWrapper>
        {getPrizeImg(number) && <PrizeImg src={getPrizeImg(number)} />}
        <NumberSpan>{getText(number)}</NumberSpan>
      </NumberWrapper>
      <NicknameSpan>Alex</NicknameSpan>
      <TimeSpan>12 : 12 : 12</TimeSpan>
      <ScoreSpan>5 400</ScoreSpan>
    </StyledItem>
  )
}
