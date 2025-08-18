import React from 'react'
import styled from 'styled-components'
import avatar from '../../assets/avatar.jpg'
const StyledUserItem = styled.li`
background: #26B291;
width: 100%;
display: flex;
padding: 7px 0;
border-radius: 7px;
position: absolute;
bottom: -100px;
left: 50%;
transform: translateX(-50%);
color: rgb(224,255,251);
`

const StyledContentWrapper = styled.div`
width: 95%;
margin: auto;
display:flex;
align-items: center;
justify-content: space-between;
font-family: 'Conthrax', sans-serif;
`

const StyledNumberSpan = styled.span`
display: flex;
justify-content: right;
align-items: center;
min-width: 30px;
color: rgb(224,255,251);
font-size: 12px;
font-weight: 700;`

const StyledUserProfile = styled.div`
display: flex;
gap: 18px;
align-items: center;
`

const StyledUserImg = styled.img`
width: 25px;
height: 25px;
border-radius: 50%;
`

const StyledUserSpan = styled.span`
color: rgb(224,255,251);
font-size: 11px;`

const StyledUserInfo = styled.div`
display: flex; 
align-items: center;
gap: 14px;
`

const StyledUserTime = styled.span`
color: rgb(224,255,251);
font-family: 'Roboto', sans-serif;
font-weight: 100;
font-size: 11px;`

const StyledUserScore = styled.span`
color: rgb(224,255,251);
font-weight: 700;
font-size: 11px;
`


export default function UserResult() {
  return (
    <StyledUserItem>
        <StyledContentWrapper>
            <StyledNumberSpan>#{4445}</StyledNumberSpan>
            <StyledUserProfile>
                <StyledUserImg src={avatar}/>
                <StyledUserSpan>Alex</StyledUserSpan>
            </StyledUserProfile>
            <StyledUserInfo>
                <StyledUserTime>
                    16 : 35 : 37
                </StyledUserTime>
                <StyledUserScore>
                    4 700
                </StyledUserScore>
            </StyledUserInfo>
        </StyledContentWrapper>
    </StyledUserItem>
  )
}
