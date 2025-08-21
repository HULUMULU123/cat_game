import React from 'react'
import styled from 'styled-components'
import Header from '../common/Header'
import SectionInfo from '../../common/SectionInfo'

const StyledWrapper = styled.div`
  width:90%;
`
export default function PrizeModal({handleClose}) {
  return (
    <StyledWrapper>
        <Header infoType='prize' handleClose={handleClose}/>
        <SectionInfo InfoName={'НАГРАДЫ ТЕКУЩЕГО СБОЯ'}/>
    </StyledWrapper>
  )
}
