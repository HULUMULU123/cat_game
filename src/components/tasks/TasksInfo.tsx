import styled from "styled-components"

const StyledContentWrapper = styled.div`
width: 95%;
background-color: rgba(217,217,217,0.6);
border-radius: 7px;
`

const StyledWrapper = styled.div`
width:90%;
display:flex;
flex-direction:row;
align-items: center;
font-family: 'Conthrax', sans-serif;
`

const StyledInfoName = styled.span`
font-size:22px;
font-weight:700;`

const StyledInfoTime = styled.span`
font-size:12px;`

const StyledInfoLine = styled.span`
display:block;
width:100%;
height:2px;
border-radius:10px;
background: #85FFF0;
`
export default function TasksInfo() {
  return (
    <StyledContentWrapper>
        <StyledWrapper>
            <StyledInfoName>ИНФО - УЗЛЫ</StyledInfoName>
            <StyledInfoTime>08 : 16 : 24</StyledInfoTime>
            <StyledInfoLine></StyledInfoLine>
        </StyledWrapper>
    </StyledContentWrapper>
  )
}
