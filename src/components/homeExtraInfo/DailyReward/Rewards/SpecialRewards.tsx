import React from 'react'
import styled from 'styled-components'
import coin from '../../../../assets/coin.png'
const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`

const StyledHeaderSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 14px;
font-weight: 700;
color: rgb(156,154,148);`

const StyledSpecialWrapper = styled.div`
width: 100%;
border-radius: 7px;
background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
display: flex;
flex-direction: column;
align-items: center;
padding: 10px 0;
`

const StyledContentImg = styled.img`
width: 20px;
height: 20px;`

const StyledContentSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 24px;
color: var(--color-white-text);
`

const StyledBottomDate = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 14px;
font-weight: 200;
color: rgb(113,140,135);
`


export default function SpecialRewards() {
  return (
    <StyledWrapper>
      <StyledHeaderSpan></StyledHeaderSpan>
        <StyledSpecialWrapper>
          <StyledContentImg src={coin} />
          <StyledContentSpan></StyledContentSpan>
        </StyledSpecialWrapper>
        <StyledBottomDate>29 / 07</StyledBottomDate>
    </StyledWrapper>
  )
}
