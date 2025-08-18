import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
    display:flex;
    position: absolute;
    bottom: 70px;
    left: 0;
`

const StyledTimerSpan = styled.span`
    font-family: 'Conthrax', sans-serif;
    font-size: 28px;
    color:#fff;
    margin: 0 auto;
`
export default function QuizTimer() {
  return (
    <StyledWrapper>
        <StyledTimerSpan>05</StyledTimerSpan>
    </StyledWrapper>
  )
}
