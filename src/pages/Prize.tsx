import React, { useState } from 'react'
import styled from 'styled-components'
import SectionInfo from '../components/common/SectionInfo'
import CoinCount from '../components/common/CoinCount'
import UsersList from '../components/prize/UsersList'
import PrevResultsModal from '../components/PrevResults/PrevResultsModal'
const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
    position:relative;
`
export default function Prize() {
   const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <StyledWrapper>
          <CoinCount isPrize setIsModalOpen={setIsModalOpen}/>
          <SectionInfo InfoName={'ТУРНИРНАЯ ТАБЛИЦА'} InfoExtra={'25 / 07 / 25'}/>
          <UsersList/>
          {isModalOpen ? <PrevResultsModal handleClose={setIsModalOpen}/> : null}
      </StyledWrapper>
  )
}
