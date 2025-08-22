import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
width: 95; 
margin: 15px auto;
display: flex; 
flex-direction: column;
align-items: center;
font-family: 'Conthrax', sans-serif;
gap: 30px;
color: rgb(157,185,181);`


const StyledDescription = styled.p`
width: 60%;
text-align: justify;
font-size: 12px;
font-weight: 800;
 `

const StyledDateSpan = styled.span`
font-size: 10px;
font-weight: 800;
`
export default function PrizeDescription() {
  return (
    <StyledWrapper>
        <StyledDescription>В КАЖДОМ СБОЕ ПОБЕДИТЕЛЬ ПОЛУЧИТ КЛАССНУЮ ТЕХНИКУ - УЧАСТВУЙТЕ И ЗАРАБАТЫВАЙТЕ ЦЕННЫЕ ПРИЗЫ !</StyledDescription>
        <StyledDateSpan>25 / 07/ 2025</StyledDateSpan>
    </StyledWrapper>
  )
}
