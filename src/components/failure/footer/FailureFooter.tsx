import React from 'react'
import styled from 'styled-components'
import failure_bottom from '../../../assets/failure_bottom.png'
import BounusList from './BounusList'
const Wrapper = styled.div`
    height: 15vh;
    width: 100%;
    background: rgba(0,0,0,0.8);
    position: relative;
`

const BottomWrapper = styled.div`
width: 100%;
bottom:0;
left:0;
position: absolute;
display: flex;
`

const StyledScroreWrapper = styled.div`
margin: auto;
display: flex;
flex-direction: column;
align-items: center;
gap: 15px;`

const StyledScoreSpan = styled.span`
  color: #fff;
  font-size: 40px;
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(44, 194, 169, 0.8), 
               0 0 16px rgba(44, 194, 169, 0.6); /* зеленое свечение */
`


const StyledScoreInfo = styled.span`
color: #E1FFFB;
font-size: 12px;
font-family: 'Conthrax', sans-serif;
font-weight: 700;`

const StyledBottomImg = styled.img`
width: 100%;
margin-top: auto;
`

export default function FailureFooter() {
  return (
    <Wrapper>
        <BounusList />
        <BottomWrapper>
            <StyledScroreWrapper>
                <StyledScoreSpan>368</StyledScoreSpan>
                <StyledScoreInfo>очков заработано</StyledScoreInfo>
            </StyledScroreWrapper>
            <StyledBottomImg src={failure_bottom}/>
        </BottomWrapper>
    </Wrapper>
  )
}
