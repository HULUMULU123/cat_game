import React, { useMemo } from 'react'
import styled from 'styled-components'

import useGlobalStore from '../../../shared/store/useGlobalStore'

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

export default function UserStatisticsContent() {
  const stats = useGlobalStore((state) => state.profileStats)

  const formattedStats = useMemo(
    () => ({
      failures: stats.failuresCompleted.toLocaleString('ru-RU'),
      quizzes: stats.quizzesCompleted.toLocaleString('ru-RU'),
      tasks: stats.tasksCompleted.toLocaleString('ru-RU'),
    }),
    [stats.failuresCompleted, stats.quizzesCompleted, stats.tasksCompleted],
  )

  return (
    <StyledStatisticsContent>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>СБОЕВ ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>{formattedStats.failures}</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>ВИКТОРИН ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>{formattedStats.quizzes}</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
          <StyledStatisticsSpanWrapper>
            <StyledStatisticsSpan>ИНФО-УЗЛОВ ПРОЙДЕНО</StyledStatisticsSpan>
            <StyledStatistcPoints></StyledStatistcPoints>
            <StyledStatisticResultSpan>{formattedStats.tasks}</StyledStatisticResultSpan>
          </StyledStatisticsSpanWrapper>
        </StyledStatisticsContent>
  )
}
