import React from 'react'
import styled from 'styled-components'

const StyledRulesItem = styled.li`
height: 50px;

`

const StyledRuleImg = styled.img`
width: 30px;`

const StyledRuleText = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 8px;
text-align: center;
color: var(--color-white-text);`

const StyledButton = styled.button`
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-content: space-between;
`
export default function RulesItem({icon, text}) {
  return (
    <StyledRulesItem>
      <StyledButton onClick={()=>console.log('click')}>
        <StyledRuleImg src={icon} />
        <StyledRuleText>{text}</StyledRuleText>
      </StyledButton>
    </StyledRulesItem>
  )
}
