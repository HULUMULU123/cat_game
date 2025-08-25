import React from 'react'
import styled from 'styled-components'

import FriendItem from './FriendItem'
const StyledStatisticsContent = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width:90%;
gap: 15px;
`

const StyledStatisticsSpanWrapper = styled.div`
width: 100%;
display: flex;
align-items: end;
`

const StyledStatisticsSpan = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 11px;
font-weight: 200;
color: var(--color-white-text);
`

const StyledStatistcPoints = styled.span`
flex-grow: 1;
border-bottom: 1px dotted var(--color-white-text);
margin: 0 5px;`

const StyledStatisticResultSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 20px;
font-weight: 700;
color: var(--color-white-text);
`

const StyledFriendsContent = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width:90%;
gap: 15px;`

const StyledFriendsRoadMap = styled.div`
margin-top: 20px;
position: relative;
width: 100%;
display:flex;
align-items: center;`

const StyledFriendsLine = styled.span`
position: absolute;
width: 100%;
top: 45%;
/* transform: translateY(-50%); */
left: 0;
background: #85FFF0;
border-radius: 10px;
display: block;
height: 1px;`

const StyledFriendsList = styled.ul`
margin: 0;
padding: 0;
display: flex; 
list-style: none;
width: 100%;
justify-content: space-around;
`




export default function UserFriendsContent() {
  return (
    <StyledFriendsContent>
          <StyledStatisticsSpanWrapper>
          <StyledStatisticsSpan>ПРИГЛАШЕНО ДРУЗЕЙ</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>22</StyledStatisticResultSpan>
            </StyledStatisticsSpanWrapper>
            <StyledFriendsRoadMap>
              <StyledFriendsLine></StyledFriendsLine>
                <StyledFriendsList>
                    <FriendItem/>
                    <FriendItem/>
                    <FriendItem/>
                    <FriendItem/>
                    <FriendItem/>
                </StyledFriendsList>

            </StyledFriendsRoadMap>
        </StyledFriendsContent>
  )
}
