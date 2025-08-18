import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
width:95%;
margin: 32px auto 0 auto;
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
width: 70%;
text-align: center;
`

const StyledAnswersList = styled.ul`
padding: 0;

display:flex;
gap: 5px;
flex-direction: column;
margin-top: 17px;
align-items:center;
`
const StyledAnwerContent = styled.div`
    width:80%;
    display: flex;
    margin: 0 auto;
    align-items: center;
    gap: 20px;
`

const StyledAnswersItem = styled.li`
    width:95%;
    display: flex;
    background: #126358;
    background: linear-gradient(216deg, rgba(18, 99, 88, 0.7) 0%, rgba(119, 162, 148, 0.5) 50%);
    border-radius: 7px;
    padding: 7px 0;
`

const StyledAnswerNumber = styled.span`
color: #fff;
font-size: 20px;
font-family: 'Conthrax', sans-serif;
font-weight: 700;
display: flex;
width: 20px;
justify-content: center;
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
            <StyledQuestionSpan>КТО ТАКОЙ <br/> АЛЕКСАНДР МАКЕДОНСКИЙ?</StyledQuestionSpan>
            <StyledAnswersList>
                <StyledAnswersItem>
                    <StyledAnwerContent>
                        <StyledAnswerNumber>1</StyledAnswerNumber>
                        <StyledAnswerText>Основатель Римской Империи</StyledAnswerText>
                    </StyledAnwerContent>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnwerContent>
                        <StyledAnswerNumber>2</StyledAnswerNumber>
                        <StyledAnswerText>Великий полководец и царь</StyledAnswerText>
                    </StyledAnwerContent>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnwerContent>
                        <StyledAnswerNumber>3</StyledAnswerNumber>
                        <StyledAnswerText>Учёный из Древней Греции</StyledAnswerText>
                    </StyledAnwerContent>
                </StyledAnswersItem>
                <StyledAnswersItem>
                    <StyledAnwerContent>
                        <StyledAnswerNumber>4</StyledAnswerNumber>
                        <StyledAnswerText>Мифический герой Спарты</StyledAnswerText>
                    </StyledAnwerContent>
                </StyledAnswersItem>
            </StyledAnswersList>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
