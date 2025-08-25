import React from 'react'
import styled from 'styled-components'
import clock from '../../assets/rules_icons/clock.svg'
import HeaderCloseBtn from '../homeExtraInfo/common/HeaderCloseBtn'


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


const StyledModalImg = styled.img`
width:20px;
height: 20px;`

export default function Header({handleClose}) {
  return (
    <StyledHeader>
        <StyledCoinWrapper>
            <StyledModalImg src={clock}/>
            
        </StyledCoinWrapper>
        <HeaderCloseBtn handleClose={handleClose} />
    </StyledHeader>
  )
}