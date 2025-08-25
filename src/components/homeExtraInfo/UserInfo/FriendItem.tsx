import React from 'react'
import styled from 'styled-components'

const StyledFriendsItem = styled.li`
display: flex;
align-items: center;
flex-direction: column;
gap: 5px;
font-family: 'Conthrax', sans-serif;
`

const StyledFriendsSpan = styled.span`

font-size: 12px;
font-weight: 800;
color: rgb(129, 171, 164);`

const StyledFriendsPoint = styled.span`
display: block;
width: 10px;
height: 10px;
background-color: #fff;
border-radius: 50%;`

const StyledFriendsImgWrapper = styled.div`
display: flex; 
gap: 5px;
background: #000;
border-radius: 7px;`

const StyledFriendsImg = styled.img`
width: 20px;
height: 20px;`

const StyledFriendsImgSpan = styled.span`
color: #fff;
font-weight: 800;
font-size: 12px;
`
export default function FriendItem() {
  return (
    <StyledFriendsItem>
        <StyledFriendsSpan>10</StyledFriendsSpan>
        <StyledFriendsPoint></StyledFriendsPoint>
        <StyledFriendsImgWrapper>
            <StyledFriendsImg src={coin}/>
            <StyledFriendsImgSpan>100</StyledFriendsImgSpan>
        </StyledFriendsImgWrapper>
    </StyledFriendsItem>
)
}
