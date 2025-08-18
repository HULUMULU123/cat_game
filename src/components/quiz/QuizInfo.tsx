import React from 'react'
import styled from 'styled-components'
import MyIcon from '../icons/MyIcon'
import QuizTimer from './QuizTimer'
import check from '../../assets/icons/check.svg'
import advert from '../../assets/icons/advert.svg'
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
width: 100%;
`

const StyledRoadWrapper = styled.div`
margin: 0 auto;
width:100%;
display: flex;
position: relative;
`

const StyledLine = styled.span`
display: block; 
position: absolute;
left: 0;
top: 60%;
/* transform: translateY(-50%); */
width: 100%;
height:3px;
background: #85FFF0;
border-radius: 10px;
`

const StyledPoint = styled.span`
height: 15px;
width: 15px;
border-radius: 50%;
background: #fff;
position: absolute;
top: 50%;
left: 50%;
transform: translateX(-50%);
`

const StyledList = styled.ul`
padding: 0;
display:flex;
width: 80%;
justify-content: space-between;
align-items:center;
margin: 0 auto;
`

const StyledItem = styled.li`
display:flex;
flex-direction:column;
justify-content: space-between;
height: 50px;
align-items: center;
gap: 35px;
position: relative;
`

const StyledDoneSpan = styled.span`
color:#fff;`

const StyledDoneImg = styled.img`
width: 15px;`

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
                        <StyledDoneImg src={check}/>
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>2 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg src={advert} />
                    </StyledItem>
                    <StyledItem>
                        <StyledDoneSpan>3 / 5</StyledDoneSpan>
                        <StyledPoint></StyledPoint>
                        <StyledDoneImg src={check}/>
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
