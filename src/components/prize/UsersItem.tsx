import React from 'react'
import styled from 'styled-components'
import avatar from '../../assets/avatar.jpg'
const StyledUserItem = styled.li`
background: #126358;
background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
width: 100%;
display: flex;
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
border: 50%;
`

const StyledUserSpan = styled.span`
color: rgb(141, 169, 163);
font-size: 11px;`

const StyledUserInfo = styled.div`
display: flex; 
align-items: center;
gap: 14px;
`

const StyledUserTime = styled.span`
font-weight: 100;
font-size: 11px;`

const StyledUserScore = styled.span`
font-weight: 700;
font-size: 11px;
`

export default function UsersItem({number}) {
  return (
    <StyledUserItem>
        <StyledContentWrapper>
            <StyledNumberSpan>#{number}</StyledNumberSpan>
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
