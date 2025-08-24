import React from 'react'
import styled from 'styled-components'
import avatar from '../../../assets/avatar.jpg'
const StyledWrapper = styled.div`
display: flex;
width: 95%;
justify-content:space-between;
align-items: center;
margin: 0 auto;
`

const StyledImgWrapper = styled.div`
width: 50px;
height:50px;
overflow: hidden;
border-radius:50%;
border: 2px solid #85FFF0;
box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
-webkit-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
-moz-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);`

const StyledImg = styled.img`
width: 100%;
height:100%;
`

const StyledUsernameWrapper = styled.div`
width: 60%;
background: rgba(255,255,255,0.2);
display: flex;
align-items:center;
border-radius: 7px;`

const StyledUsernameSpan = styled.span`
color:#fff;
font-family: 'Conthrax', sans-serif;
font-weight: 700;
margin-left: 20px;
font-size: 16px;
`
export default function UserInformation() {
  return (
    <StyledWrapper>
        <StyledImgWrapper>
            <StyledImg src={avatar}/>
        </StyledImgWrapper>
        <StyledUsernameWrapper>
            <StyledUsernameSpan>Alex</StyledUsernameSpan>
        </StyledUsernameWrapper>
    </StyledWrapper>
  )
}
