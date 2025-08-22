import React from 'react'
import styled from 'styled-components'
import MyIcon from '../icons/MyIcon'
import QuizTimer from './QuizTimer'
import check from '../../assets/icons/check.svg'
import advert from '../../assets/icons/advert.svg'
const StyledWrapper = styled.div`
position: relative;
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
background:${({ $advert }) => ($advert ? "#40FFDF" : "#fff")};
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
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 700;
color:${({ $advert }) => ($advert ? "rgb(46,51,67)"  : "rgb(116,135,131)")};`

const StyledDoneImg = styled.img`
width: 20px;`

const StyledPrize = styled.div`
display: flex;
align-items: center;
padding: 7px 21px;
background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  gap: 10px;
  border-radius: 7px;
  position: absolute;
  bottom: -35px;
`

const StyledPrizeSpan = styled.span`
color:#fff;
font-family: 'Conthrax', sans-serif;
font-size: 16px;`



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
                        <StyledDoneSpan $advert>2 / 5</StyledDoneSpan>
                        <StyledPoint $advert></StyledPoint>
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
                            <StyledPrizeSpan>1</StyledPrizeSpan>
                            <MyIcon fill='#fff' width={25} height={23}/>
                        </StyledPrize>
                    </StyledItem>
                </StyledList>
            </StyledRoadWrapper>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
