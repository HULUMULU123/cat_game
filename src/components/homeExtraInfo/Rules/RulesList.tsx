import React from 'react'
import styled from 'styled-components'
import RulesItem from './RulesItem'

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width: 95%;
margin: 20px auto;
gap: 15px;
`

const StyledListHeadingWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 5px;
width: 90%;
`

const StyledLine = styled.span`
display: block;
width: 100%;
height: 1px;
background: #85FFF0;
border-radius: 10px;`

const StyledHeadingSpan = styled.span`
color: #fff;
font-family: 'Conthrax', sans-serif;
font-size: 12px;`

const StyledRulesList = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding:0;
    margin: 0;
    width: 95%;
`

export default function RulesList() {
  return (
    <StyledWrapper>
        <StyledListHeadingWrapper>
            <StyledHeadingSpan>КАТЕГОРИИ</StyledHeadingSpan>
            <StyledLine></StyledLine>
        </StyledListHeadingWrapper>
        <StyledRulesList>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
            <RulesItem/>
        </StyledRulesList>
    </StyledWrapper>
  )
}
