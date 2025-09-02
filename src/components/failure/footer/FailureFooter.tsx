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
  bottom: 0;
  left: 0;
  position: absolute;
`

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledScroreWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const StyledScoreSpan = styled.span`
  color: #fff;
  font-size: 40px;
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(44, 194, 169, 0.8),
               0 0 16px rgba(44, 194, 169, 0.6);
`

const StyledScoreInfo = styled.span`
  color: #E1FFFB;
  font-size: 12px;
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
`

const StyledBottomImg = styled.img`
  width: 100%;
  display: block;
`

export default function FailureFooter() {
  return (
    <Wrapper>
      <BounusList />
      <BottomWrapper>
        <ImageWrapper>
          <StyledBottomImg src={failure_bottom} />
          <StyledScroreWrapper>
            <StyledScoreSpan>368</StyledScoreSpan>
            <StyledScoreInfo>очков заработано</StyledScoreInfo>
          </StyledScroreWrapper>
        </ImageWrapper>
      </BottomWrapper>
    </Wrapper>
  )
}
