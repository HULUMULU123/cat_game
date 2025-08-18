import React from 'react'
import styled from 'styled-components'
import coin from '../../assets/coin.png'
const StyledWrapper = styled.div`
display:flex;
position: relative;
width: 95%;
height: 100px;
margin: 0 auto;
`
const StyledContentWrapper = styled.ul`
    height:50%;
    padding:0;
    width: 90%;
    display:flex;
    margin:  auto;
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
    font-family: 'Conthrax', sans-serif;
    font-size: 10px;
    font-weight: 700;
`

const StyledDoneSpan = styled.span`
    display:block;
    color: rgb(134,180,173);
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
text-align: right;
color: rgb(224, 255, 251);`

const StyledCoinImg = styled.img`
    width: 15px;
    height: 15px;
    margin-left: 10px;
`
export default function SimulationRoadMap() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledGoalItem>
                <StyledDoneSpan>100 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>100 <StyledCoinImg src={coin}/></StyledGoalSpan>
            </StyledGoalItem>
            <StyledGoalItem>
                <StyledDoneSpan>200 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>500 <StyledCoinImg src={coin}/></StyledGoalSpan>
            </StyledGoalItem>
            <StyledGoalItem>
                <StyledDoneSpan>260 / 260</StyledDoneSpan>
                <StyledPointSpan></StyledPointSpan>
                <StyledGoalSpan>1000 <StyledCoinImg src={coin}/></StyledGoalSpan>
            </StyledGoalItem>
        </StyledContentWrapper>
        <StyledLine></StyledLine>
    </StyledWrapper>
  )
}
