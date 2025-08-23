import React from 'react'
import RulesHeader from './RulesHeader'
import styled from 'styled-components'
import ModalName from '../common/ModalName'
const StyledWrapper = styled.div`
  width:100%;
`
export default function OpenRuleModal({handleClose, ruleCategory}) {
    console.log(ruleCategory)
  return (
    <StyledWrapper>
        <RulesHeader handleClose={handleClose}/>
        <ModalName textName={ruleCategory.toUpperCase()} />
    </StyledWrapper>
  )
}
