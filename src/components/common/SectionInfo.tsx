import styled from "styled-components"

const StyledContentWrapper = styled.div`
width: 100%;
background-color: rgba(217,217,217,0.2);
border-radius: 7px;
padding: 20px 0 10px 0;
margin: 0 auto;
`

const StyledWrapper = styled.div`
width:90%;
display:flex;
flex-direction:column;
align-items: center;
font-family: 'Conthrax', sans-serif;
margin: 0 auto;
`

const StyledInfoName = styled.span`
font-size:21px;
font-weight:700;
margin-bottom:15px;
color: #E1FFFB;
text-align: center;
`

const StyledInfoTime = styled.span`
font-size:12px;
margin-bottom: 8px;
color: #E1FFFB;
`

const StyledInfoLine = styled.span`
display:block;
width:100%;
height:2px;
border-radius:10px;
background: #85FFF0;
`
export default function SectionInfo({InfoName, InfoExtra=null}) {
  return (
    <StyledContentWrapper>
        <StyledWrapper>
            <StyledInfoName>{InfoName}</StyledInfoName>
            {InfoExtra?<StyledInfoTime>{InfoExtra}</StyledInfoTime>:null}
            <StyledInfoLine></StyledInfoLine>
        </StyledWrapper>
    </StyledContentWrapper>
  )
}
