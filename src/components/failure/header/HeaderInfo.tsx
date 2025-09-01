import React from 'react'
import styled from 'styled-components'
import cross from '../../../assets/icons/cancel.svg'
const Wrapper = styled.div`
display: flex;
flex-direction: column;
align-items: end;
gap: 15px;
width: 60%;
`

const StyledHeadSection = styled.div`
display: flex;
align-items: center;
justify-content: space-between;`

const StyledBottomSection = styled.div`
display: flex;
align-items: end;
flex-direction: column;`

const StyledHeaderSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 22px;
font-weight: 700;`

const StyledCloseBtn = styled.button`
border: none;
background: transparent;
width: 25px;
height: 25px;`

const StyledCloseImg = styled.img`
    width: 100%;
    height: 100%;
`
const StyledLine = styled.span`
display: block;
width: 90%;
height: 1px;
background: #85FFF0;
margin-bottom: 7px;`

const StyledTimeSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 700;`
export default function HeaderInfo() {
  return (
    <Wrapper>
        <StyledHeadSection>
            <StyledHeaderSpan>СБОЙ ///</StyledHeaderSpan>
            <StyledCloseBtn>
                <StyledCloseImg src={cross} />
            </StyledCloseBtn>
        </StyledHeadSection>
        <StyledBottomSection>
            <StyledLine></StyledLine>
            <StyledLine></StyledLine>
            <StyledTimeSpan>03 : 59 : 58</StyledTimeSpan>
        </StyledBottomSection>
    </Wrapper>
  )
}
