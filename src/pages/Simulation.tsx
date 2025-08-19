import React, { useState } from 'react'
import styled from 'styled-components'
import CoinCount from '../components/common/CoinCount'
import SectionInfo from '../components/common/SectionInfo'
import SectionContent from '../components/simulation/SectionContent'
import SimulationRoadMap from '../components/simulation/SimulationRoadMap'
import SimulationTimer from '../components/simulation/SimulationTimer'
import ModalLayout from '../components/modalWindow/ModalLayout'
import ModalWindow from '../components/modalWindow/ModalWindow'
import black_advert from '../assets/icons/black_advert.svg'
const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`
const StyledBtnContentWrapper = styled.div`
  display: flex;
  margin: auto;
  width: 20px;
  height: 20px;
`

const StyledBtnContentImg = styled.img`
  width: 100%;
  height: 100%;
`

function BtnContent() {
  return(
    <StyledBtnContentWrapper>
      <StyledBtnContentImg src={black_advert}/>
    </StyledBtnContentWrapper>
  )
}

export default function Simulation() {
  const [openModal, setOpenModal] = useState(false)
  return (<>
    <StyledWrapper>
        <CoinCount/>
        <SectionInfo InfoName={'СИМУЛЯЦИЯ'} InfoExtra={'0 / 260'}/>
        <SectionContent setOpenModal={setOpenModal}/>
        <SimulationRoadMap/>
        <SimulationTimer/>
    </StyledWrapper>
    {openModal ? <ModalLayout isOpen={openModal}>
                        <ModalWindow header='НЕДОСТАТОЧНО CRASH' text='ЗАПУСТИТЬ СИМУЛЯЦИЮ МОЖНО ЗА ПРОСМОТР РЕКЛАМЫ' btnContent={<BtnContent/>} isOpenModal={openModal} setOpenModal={setOpenModal}/>
                      </ModalLayout> : null}
    </>
  )
}
