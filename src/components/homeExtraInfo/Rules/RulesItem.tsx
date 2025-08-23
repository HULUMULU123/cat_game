import React from 'react'
import styled from 'styled-components'

const StyledRulesItem = styled.li`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 7px;
`

const StyledRuleImg = styled.img`
width: 44px;`

const StyledRuleText = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 8px;
text-align: center;
color: var(--color-white-text);`

export default function RulesItem({icon, text}) {
  return (
    <StyledRulesItem>
      <StyledRuleImg src={icon} />
      <StyledRuleText>{text}</StyledRuleText>
    </StyledRulesItem>
  )
}
