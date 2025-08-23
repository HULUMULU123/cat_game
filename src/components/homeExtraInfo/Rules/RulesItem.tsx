import React from 'react'
import styled from 'styled-components'

const StyledRulesItem = styled.li`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;`

const StyledRuleImg = styled.img``

const StyledRuleText = styled.span``

export default function RulesItem({icon, text}) {
  return (
    <StyledRulesItem>
      <StyledRuleImg src={icon} />
      <StyledRuleText>{text}</StyledRuleText>
    </StyledRulesItem>
  )
}
