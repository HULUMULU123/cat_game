import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'
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
width: 20px;
height: 20px;
background-color: #fff;
border-radius: 50%;`

const StyledFriendsImgWrapper = styled.div`
display: flex; 
gap: 5px;
background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
border-radius: 7px;
align-items: center;
padding: 15px 7px;`

const StyledFriendsImg = styled.img`
width: 20px;
height: 20px;`

const StyledFriendsImgSpan = styled.span`
color: var(--color-white-text);
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
