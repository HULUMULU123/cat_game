import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.span`
    position: absolute;
    bottom: 110px;
    left: 50%;
    transform: translateX(-50%);
    color:#fff;
    font-family: "Conthrax",sans-serif;
    font-size: 28px;
    font-weight: 700;
`

export default function SimulationTimer() {
  return (
    <StyledWrapper>1 : 00</StyledWrapper>
  )
}
