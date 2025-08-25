import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'
import UserStatisticsContent from './UserStatisticsContent'
import UserFriendsContent from './UserFriendsContent'

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items:center;
  gap: 5px;
  font-family:'Conthrax', sans-serif;
  width: 100%;
`

const StyledBlockHeader = styled.h3`
  margin: 0;
  padding:0;
  display: inline;
  color: var(--color-white-text);
  font-size: 12px;
  font-weight:500;
`

const StyledStatisticsWrapper = styled.div`
  width: 100%;
  background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content:center;
  border-radius: 7px;
  padding: 20px 0;
  flex-direction: column;
  gap: 60px;
`



export default function UserBalance() {
  return (
    <StyledWrapper>
      <StyledBlockHeader>СТАТИСТИКА</StyledBlockHeader>
      <StyledStatisticsWrapper>
        <UserStatisticsContent/>
        <UserFriendsContent/>
      </StyledStatisticsWrapper>
    </StyledWrapper>
  )
}
