import React from 'react'
import styled from 'styled-components'
import user from '../../../assets/icons/user.svg'
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


const StyledModalImg = styled.img`
width:20px;
height: 20px;`

export default function UserHeader({handleClose}) {
  return (
    <StyledHeader>
        <StyledCoinWrapper>
            <StyledModalImg src={user}/>
            
        </StyledCoinWrapper>
        <HeaderCloseBtn handleClose={handleClose} />
    </StyledHeader>
  )
}