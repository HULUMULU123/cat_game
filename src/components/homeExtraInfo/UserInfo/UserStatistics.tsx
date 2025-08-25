import React from 'react'
import styled from 'styled-components'
import coin from '../../../assets/coin.png'

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
`

const StyledStatisticsContent = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width:90%;
gap: 20px;
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

const StyledFriendsContent = styled.div``

const StyledFriendsRoadMap = styled.div``

const StyledFriendsLine = styled.span``

const StyledFriendsInfo = styled.div``

const StyledFriendsSpan = styled.span``

const StyledFriendsPoint = styled.span``

const StyledFriendsImgWrapper = styled.div``

const StyledFriendsImg = styled.img``

const StyledFriendsImgSpan = styled.span``


export default function UserBalance() {
  return (
    <StyledWrapper>
      <StyledBlockHeader>СТАТИСТИКА</StyledBlockHeader>
      <StyledStatisticsWrapper>
        <StyledStatisticsContent>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>СБОЕВ ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>13</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>ВИКТОРИН ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>32</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>ИНФО-УЗЛОВ ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>50</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
        </StyledStatisticsContent>
      </StyledStatisticsWrapper>
    </StyledWrapper>
  )
}
