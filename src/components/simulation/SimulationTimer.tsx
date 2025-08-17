import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.span`
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
`

export default function SimulationTimer() {
  return (
    <StyledWrapper>SimulationTimer</StyledWrapper>
  )
}
