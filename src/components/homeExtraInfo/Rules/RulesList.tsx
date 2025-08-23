import React from 'react'
import styled from 'styled-components'
import RulesItem from './RulesItem'
import clock from '../../../assets/rules_icons/clock.svg'
import drops from '../../../assets/rules_icons/drops.svg'
import gift from '../../../assets/rules_icons/gift.svg'
import logo_cercle from '../../../assets/rules_icons/logo_circle.svg'
import logo from '../../../assets/rules_icons/logo.svg'
import money from '../../../assets/rules_icons/money.svg'
import points from '../../../assets/rules_icons/points.svg'
import right_text from '../../../assets/rules_icons/right_text.svg'
import alert from '../../../assets/rules_icons/alert.svg'
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
            <RulesItem icon={logo} text="СТАКАН"/>
            <RulesItem icon={drops} text="СБОЙ"/>
            <RulesItem icon={logo_cercle} text="CRASH"/>
            <RulesItem icon={right_text} text="УСЛОВИЯ УЧАСТИЯ"/>
            <RulesItem icon={gift} text="АНОМАЛИЯ"/>
            <RulesItem icon={alert} text="ЗАПРЕЩЕННЫЕ ДЕЙСТВИЯ"/>
            <RulesItem icon={money} text="ПЕРЕДАЧА МАТЕРИАЛЬНОГО АНАЛОГА"/>
            <RulesItem icon={clock} text="ТУРНИРЫ И ТАЙМЕРЫ" />
            <RulesItem icon={points} text="ДОПОЛНИТЕЛЬНО" />
        </StyledRulesList>
    </StyledWrapper>
  )
}
