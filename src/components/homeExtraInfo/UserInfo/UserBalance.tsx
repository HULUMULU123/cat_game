import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items:center;
  gap: 5px;
  font-family:'Conthrax', sans-serif;
  width: 100%;
`

const StyledBlockHeader = styled.h3`
  margin: 0;
  padding:0;
  display: inline;
  color: var(--color-white-text);
  font-size: 12px;
  font-weight:500;
`

const StyledCoinWrapper = styled.div`
  width: 100%;
  background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content:center;
  border-radius: 7px;
  padding: 20px 0;
`

const StyledCoinContent = styled.div`
  width: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const StyledCoinImg = styled.img`
width: 30px;
height: 30px;`

const StyledCoinBalance = styled.span`
font-size: 30px;
font-weight: 700;
color: #fff;
`
export default function UserBalance() {
  return (
    <StyledWrapper>
      <StyledBlockHeader>БАЛАНС CRASH</StyledBlockHeader>
      <StyledCoinWrapper>
        <StyledCoinContent>
          <StyledCoinImg src={coin}/>
          <StyledCoinBalance>5 500</StyledCoinBalance>
        </StyledCoinContent>
      </StyledCoinWrapper>
    </StyledWrapper>
  )
}
