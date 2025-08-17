import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
    width: 95%;
    border-radius: 7px;
    background: #126358;
    background: radial-gradient(circle, rgba(18, 99, 88, 0.84) 50%, rgba(119, 162, 148, 0) 100%);
    padding: 15px 0 7px 0;
`
const StyledContentWrapper = styled.div`
    width: 95%;
    display: flex;
    flex-direction:column;
    align-items:center;
`

const StyledTextP = styled.p`
    padding:0; 
    margin: 0;
    font-family: 'Conthrax', sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    width:100%;
    color: rgb(168, 211, 205);
`
const StyledTextSpan = styled.span`
    font-family: 'Conthrax', sans-serif;
    font-size: 10px;
    margin: 10px auto;
    color: rgb(51,103,92);
`

const StyledButton = styled.button`
    display: flex;
    border: none;
    background: #126358;
    background: radial-gradient(circle, rgba(18, 99, 88, 0.84) 50%, rgba(119, 162, 148, 0) 100%);
    display: flex;
    width: 60%;
`
export default function SectionContent() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledTextP style={{marginBottom: '5px'}}>“СИМУЛЯЦИЯ” - БЕЗВРЕМЕННЫЙ ТРЕНАЖЁР, ИМИТИРУЮЩИЙ СБОЙ. ЗДЕСЬ ВЫ МОЖЕТЕ ТРЕНИРОВАТЬСЯ В ЛЮБОЕ ВРЕМЯ.</StyledTextP>
            <StyledTextP>ИГРАЙТЕ И ЗАРАБАТЫВАЙТЕ ЦЕННЫЕ ПРИЗЫ !</StyledTextP>
            <StyledTextSpan>ЗАПУСТИТЬ СИМУЛЯЦИЮ</StyledTextSpan>
            <StyledButton>200</StyledButton>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
