import React from 'react'
import styled from 'styled-components'
import rules from '../../../assets/icons/rules.svg'
import HeaderCloseBtn from '../common/HeaderCloseBtn'

const StyledHeader = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
width: 85%;
padding: 15px 20px;
margin: 0px auto;
`

const StyledCoinWrapper = styled.div`
display:flex;
gap: 10px;
align-items: center;
`

const StyledCoinCount = styled.span`
font-size: 16px;
font-family: 'Conthrax', sans-serif;
color: #E1FFFB;
font-weight: 700;
`

const StyledModalImg = styled.img`
width:25px;
height: 25px;`

export default function RulesHeader({handleClose}) {
  return (
    <StyledHeader>
        <StyledCoinWrapper>
            <StyledModalImg src={rules}/>
            
        </StyledCoinWrapper>
        <HeaderCloseBtn handleClose={handleClose} />
    </StyledHeader>
  )
}