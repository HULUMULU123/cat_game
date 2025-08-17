import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
display:flex;
position: relative;
width: 95%;
height: 100px;
`
const StyledContentWrapper = styled.ul`
    height:70%;
    padding:0;
    width: 90%;
    display:flex;
    margin: 0 auto;
    justify-content: space-between;
`

const StyledLine = styled.span`
    display:block;
    width: 100%;
    height:2px;
    background: #85FFF0;
    position: absolute;
    top: 50%;
    left:0;
    transform: translateY(-50%);
`

const StyledGoalItem = styled.li`
    display: flex;
    flex-direction: column;
    /* height: 100%; */
    justify-content: space-between;
`

const StyledDoneSpan = styled.span`
    display:block;
`
const StyledPointSpan = styled.span`
    display: block;
    height:10px;
    width: 10px;
    border-radius: 50%;
    background: #85FFF0;
    margin: 0 auto;
`
const StyledGoalSpan = styled.span`
text-align: right;`

export default function SimulationRoadMap() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledGoalItem>
                <StyledDoneSpan>100 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>100</StyledGoalSpan>
            </StyledGoalItem>
            <StyledGoalItem>
                <StyledDoneSpan>200 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>500</StyledGoalSpan>
            </StyledGoalItem>
            <StyledGoalItem>
                <StyledDoneSpan>260 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>1000</StyledGoalSpan>
            </StyledGoalItem>
        </StyledContentWrapper>
        <StyledLine></StyledLine>
    </StyledWrapper>
  )
}
