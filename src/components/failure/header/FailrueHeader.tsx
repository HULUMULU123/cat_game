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


export default function FailrueHeader() {
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <Timer duration={60} />
        <HeaderInfo />
      </StyledContentWrapper>
    </StyledWrapper>
  )
}
