import React from 'react'
import styled from 'styled-components'
import MyIcon from '../icons/MyIcon'
import QuizTimer from './QuizTimer'

const StyledWrapper = styled.div`
position: relative;
width: 95%;
display:flex;
margin: 0 auto;
`

const StyledContentWrapper = styled.div`
display:flex;
flex-direction: column;
margin: 0 auto;
`

const StyledRoadWrapper = styled.div`
width:80%;
display: flex;
`

const StyledLine = styled.span`
display: block; 
position: absolute;
left: 0;
top: 50%;
transform: translateY(-50%);
width: 100%;
height:3px;
background: #85FFF0;
border-radius: 10px;
`

const StyledPoint = styled.span``

const StyledList = styled.ul`
display:flex;
width: 100%;
justify-content: space-between;
`

const StyledItem = styled.li`
display:flex;
flex-direction:column;
justify-content: space-between;
height: 50px;
`

const StyledDoneSpan = styled.span`
color:#fff;`

const StyledDoneImg = styled.img``

const StyledPrize = styled.div``

const StyledPrizeSpan = styled.span``



export default function QuizInfo() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <QuizTimer />
            <StyledRoadWrapper>
                <StyledLine></StyledLine>
                <StyledList>
                    <StyledItem>
                        <StyledDoneSpan>1 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg />
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>2 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg />
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>3 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg />
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>4 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg />
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>5 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledPrize>
                            <StyledPrizeSpan></StyledPrizeSpan>
                            <MyIcon/>
                        </StyledPrize>
                    </StyledItem>
                </StyledList>
            </StyledRoadWrapper>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
