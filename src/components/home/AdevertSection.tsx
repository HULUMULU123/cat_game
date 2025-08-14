import styled from "styled-components"
import youtube from '../../assets/youtube.png'
import ozon from '../../assets/ozon.png'
import dzen from '../../assets/dzen.png'
const StyledWrapper = styled.div`
    display:flex;
    justify-content:space-between;
    width: 90%;
    background: #fff;
`

const StyledColumn = styled.div`
    display:flex;
    flex-direction:column;
    gap: 8px;
`

const StyledButton = styled.div`
display: flex;
flex-direction:column;
align-items:center;
width: 58px;
height: 30px;
background:#000;
`

const StyledButtonImg = styled.img`
width: 80%;`

const StyledButtonSpan = styled.span``

export default function AdevertSection() {
  return (
    <StyledWrapper>
        <StyledColumn>
            <StyledButton>
                <StyledButtonImg src={youtube}/>
                <StyledButtonSpan>Youtube</StyledButtonSpan>
            </StyledButton>
            <StyledButton>
                <StyledButtonImg src={dzen}/>
                <StyledButtonSpan>DZEN</StyledButtonSpan>
            </StyledButton>
            </StyledColumn>
        <StyledColumn>
            <StyledButton>
                <StyledButtonImg src={ozon}/>
                {/* <StyledButtonSpan></StyledButtonSpan> */}
            </StyledButton>
        </StyledColumn>
    </StyledWrapper>
  )
}
