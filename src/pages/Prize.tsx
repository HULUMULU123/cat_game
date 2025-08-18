import React from 'react'
import styled from 'styled-components'
import SectionInfo from '../components/common/SectionInfo'
import CoinCount from '../components/common/CoinCount'
import UsersList from '../components/prize/UsersList'
const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`
export default function Prize() {
  return (
    <StyledWrapper>
          <CoinCount isPrize/>
          <SectionInfo InfoName={'ТУРНИРНАЯ ТАБЛИЦА'} InfoExtra={'25 / 07 / 25'}/>
          <UsersList/>
        </StyledWrapper>
  )
}
