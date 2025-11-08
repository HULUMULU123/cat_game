import React from 'react'
import styled from 'styled-components'
import Timer from './TimerRing'
import HeaderInfo from './HeaderInfo'

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

`

const StyledContentWrapper = styled.div`
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: center;`

interface FailrueHeaderProps {
  timeLeft: number;
  duration: number;
}

export default function FailrueHeader({ timeLeft, duration }: FailrueHeaderProps) {
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <Timer duration={duration} timeLeft={timeLeft} />
        <HeaderInfo />
      </StyledContentWrapper>
    </StyledWrapper>
  )
}
