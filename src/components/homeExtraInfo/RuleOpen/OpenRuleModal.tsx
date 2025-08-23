import React from 'react'
import RulesHeader from './RulesHeader'
import styled from 'styled-components'
import ModalName from '../common/ModalName'
import RulesContent from './RulesContent'

import file from '../../../assets/data/stakan_rules.json'
const StyledWrapper = styled.div`
  width:100%;
  position: relative;
  
`
export default function OpenRuleModal({handleClose, ruleCategory}) {
    console.log(ruleCategory)
    const selectedRules = file[ruleCategory];
  return (
    <StyledWrapper>
        <RulesHeader handleClose={handleClose}/>
        <ModalName textName={ruleCategory.toUpperCase()} />
        <RulesContent rulesData={selectedRules}/>
    </StyledWrapper>
  )
}
