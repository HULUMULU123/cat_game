import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'
import HeaderCloseBtn from '../common/HeaderCloseBtn'

const StyledHeader = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
`

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

export default function PrizeHeader({handleClose}) {
  return (
    <StyledHeader>
        <StyledCoinWrapper>
            <StyledCoinImg src={coin}/>
            <StyledCoinCount>500</StyledCoinCount>
        </StyledCoinWrapper>
        <HeaderCloseBtn handleClose={handleClose} />
    </StyledHeader>
  )
}