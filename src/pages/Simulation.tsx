import React from 'react'
import styled from 'styled-components'
import CoinCount from '../components/common/CoinCount'
import SectionInfo from '../components/common/SectionInfo'
import SectionContent from '../components/simulation/SectionContent'
import SimulationRoadMap from '../components/simulation/SimulationRoadMap'
import SimulationTimer from '../components/simulation/SimulationTimer'

const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`
export default function Simulation() {
  return (
    <StyledWrapper>
        <CoinCount/>
        <SectionInfo InfoName={'СИМУЛЯЦИЯ'} InfoExtra={'0 / 260'}/>
        <SectionContent />
        <SimulationRoadMap/>
        <SimulationTimer/>
    </StyledWrapper>
  )
}
