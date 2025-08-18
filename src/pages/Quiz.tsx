import React from 'react'
import CoinCount from '../components/common/CoinCount'
import SectionInfo from '../components/common/SectionInfo'
import styled from 'styled-components'

const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`

export default function Quiz() {
  return (
    <StyledWrapper>
      <CoinCount/>
      <SectionInfo InfoName={'НЕЙРОФИЛЬТР'} InfoExtra={'4 РАУНД'}/>
    </StyledWrapper>
  )
}
