import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
width:95%;
margin-top: 32px;
`

const StyledContentWrapper = styled.div`
width: 100%;
display:flex;
flex-direction:column;
`

const StyledQuestionSpan = styled.span`
margin: 0 auto;
font-size: 12px;
font-weight: 700;
font-family: "Conthrax", sans-serif;
color: rgb(224,255,251);
`

const StyledAnswersList = styled.ul`
padding: 0;
margin: 0 auto;
display:flex;
gap: 5px;
flex-direction: column;
`

const StyledAnswersItem = styled.li`
width:100%;
display: flex;
padding: 5px 10px;
`

const StyledAnswerNumber = styled.span`
color: #fff;
font-size: 20px;
font-family: 'Conthrax', sans-serif;
font-weight: 700;
`

const StyledAnswerText = styled.span`
font-size: 11px;
font-weight: 700;
font-family: 'Conthrax', sans-serif;
color: rgb(135,176,168);
`


export default function QuizPart() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledQuestionSpan>КТО ТАКОЙ АЛЕКСАНДР МАКЕДОНСКИЙ?</StyledQuestionSpan>
            <StyledAnswersList>
                <StyledAnswersItem>
                    <StyledAnswerNumber>1</StyledAnswerNumber>
                    <StyledAnswerText>Основатель Римской Империи</StyledAnswerText>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnswerNumber>2</StyledAnswerNumber>
                    <StyledAnswerText>Великий полководец и царь</StyledAnswerText>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnswerNumber>3</StyledAnswerNumber>
                    <StyledAnswerText>Учёный из Древней Греции</StyledAnswerText>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnswerNumber>4</StyledAnswerNumber>
                    <StyledAnswerText>Мифический герой Спарты</StyledAnswerText>
                </StyledAnswersItem>
            </StyledAnswersList>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
