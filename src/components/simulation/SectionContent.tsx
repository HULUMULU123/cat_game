import React from 'react'
import styled from 'styled-components'
import coin from '../../assets/coin.png'

const StyledWrapper = styled.div`
    width: 95%;
    border-radius: 7px;
    background: #126358;
    background: linear-gradient(216deg, rgba(18, 99, 88, 0.6) 0%, rgba(119, 162, 148, 0.4) 100%);
    padding: 40px 0 20px 0;
    margin: 0 auto;
    margin-top: 10px;
    backdrop-filter: blur(10px);
`
const StyledContentWrapper = styled.div`
    width: 95%;
    display: flex;
    flex-direction:column;
    align-items:center;
    margin: 0 auto;
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
    letter-spacing: 2px;
    line-height:1.5;
`
const StyledTextSpan = styled.span`
    font-family: 'Conthrax', sans-serif;
    font-size: 10px;
    margin: 20px auto 10px auto;
    color: rgb(134,180,173);
`

const StyledButton = styled.button`
    display: flex;
    border: none;
    background: #126358;
    background: linear-gradient(216deg, rgba(18, 99, 88, 0.6) 0%, rgba(119, 162, 148, 0.4) 100%);
    
    padding: 7px 50px;
    border-radius: 7px;
    font-family: 'Conthrax', sans-serif;
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    gap:20px;
`

const StyledCoinImg = styled.img`
    width: 23px;
    height:23px;
`
export default function SectionContent() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledTextP style={{marginBottom: '5px'}}>“СИМУЛЯЦИЯ” - БЕЗВРЕМЕННЫЙ ТРЕНАЖЁР, ИМИТИРУЮЩИЙ СБОЙ. ЗДЕСЬ ВЫ МОЖЕТЕ ТРЕНИРОВАТЬСЯ В ЛЮБОЕ ВРЕМЯ.</StyledTextP>
            <StyledTextP>ИГРАЙТЕ И ЗАРАБАТЫВАЙТЕ ЦЕННЫЕ ПРИЗЫ !</StyledTextP>
            <StyledTextSpan>ЗАПУСТИТЬ СИМУЛЯЦИЮ</StyledTextSpan>
            <StyledButton><StyledCoinImg src={coin}/>200</StyledButton>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
