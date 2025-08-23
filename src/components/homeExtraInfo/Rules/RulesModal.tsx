import React from 'react'
import styled from 'styled-components'
import RulesHeader from './RulesHeader'
import ModalName from '../common/ModalName'
import RulesList from './RulesList'

const StyledWrapper = styled.div`
  width:100%;
`
export default function RulesModal({handleClose}) {
  return (
    <StyledWrapper>
        <RulesHeader handleClose={handleClose}/>
        <ModalName textName='ПРАВИЛА STAKAN'/>
        <RulesList/>
    </StyledWrapper>
  )
}
