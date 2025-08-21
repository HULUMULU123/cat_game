import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'
const StyledCoinWrapper = styled.div`
display:flex;
gap: 10px;
align-items: center;
`

const StyledCoinCount = styled.span`
font-size: 16px;
font-family: 'Conthrax', sans-serif;
color: #E1FFFB;
font-weight: 700;
`

const StyledCoinImg = styled.img`
width:30px;
height: 30px;`
export default function PrizeHeader() {
  return (
    <StyledCoinWrapper>
        <StyledCoinImg src={coin}/>
        <StyledCoinCount>500</StyledCoinCount>
    </StyledCoinWrapper>
  )
}
