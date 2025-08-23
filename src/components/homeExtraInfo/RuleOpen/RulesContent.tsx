import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
width: 95%;
margin: 20px auto;
gap: 15px;
position: relative;

overflow-y: scroll;   /* только вертикальный скролл */
overflow-x: hidden;   /* горизонтального нет */
   /* отступ от контента */
box-sizing: content-box;

scrollbar-width: thin;
  scrollbar-color: #E1FFFB #2CC2A9; /* активная | неактивная *//* чтобы padding не "съел" ширину */
height: 65vh;
&::-webkit-scrollbar{
   width: 4px; 
}
&::-webkit-scrollbar-track{
  background: #2CC2A9;  /* неактивная часть */
  border-radius: 10px;
}

&::-webkit-scrollbar-thumb{
  background: #E1FFFB;  /* активная часть */
  border-radius: 20px;
}
height: 70vh;
`

const StyledListHeadingWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 5px;
width: 90%;
`

const StyledLine = styled.span`
display: block;
width: 100%;
height: 1px;
background: #85FFF0;
border-radius: 10px;`

const StyledHeadingSpan = styled.span`
color: #fff;
font-family: 'Conthrax', sans-serif;
font-size: 12px;`

const StyledRulesWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 90%;
    font-family: 'Conthrax', sans-serif;
    color: rgb(158,189,185);
`

const StyledRulesHeading = styled.h3`
margin: 20px 0 15px 0;
padding: 0;
font-size: 14px;
font-weight: 700;

`

const StyledRule = styled.p`
margin: 5px 0;
padding: 0;
font-size: 12px;
font-weight: 500;`

export default function RulesContent({ rulesData }) {
  return (
    <StyledWrapper>
      {Object.entries(rulesData).map(([sectionTitle, sectionValue]) => (<>
        <StyledListHeadingWrapper>
            <StyledHeadingSpan>{sectionTitle}</StyledHeadingSpan>
            <StyledLine></StyledLine>
        </StyledListHeadingWrapper>
        <StyledRulesWrapper key={sectionTitle}>
          {/* Если это массив правил */}
          {Array.isArray(sectionValue) &&
            sectionValue.map((rule, idx) => (
              <StyledRule key={idx}>{rule}</StyledRule>
            ))}

          {/* Если это объект с подразделами */}
          {!Array.isArray(sectionValue) &&
            typeof sectionValue === "object" &&
            Object.entries(sectionValue).map(([subTitle, rules]) => (
              <div key={subTitle}>
                <StyledRulesHeading>{subTitle}</StyledRulesHeading>
                {Array.isArray(rules) &&
                  rules.map((rule, idx) => (
                    <StyledRule key={idx}>{rule}</StyledRule>
                  ))}
              </div>
            ))}
        </StyledRulesWrapper></>
      ))}
    </StyledWrapper>
  );
}