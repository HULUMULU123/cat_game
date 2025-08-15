import styled from "styled-components"
import youtube from '../../assets/youtube.png'
import ozon from '../../assets/ozon.png'
import dzen from '../../assets/dzen.png'
const StyledWrapper = styled.div`
    display:flex;
    justify-content:space-between;
    width: 95%;
    margin: 0 auto;
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
background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -webkit-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -moz-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 7px;
  padding: 5px 0;
`

const StyledButtonImg = styled.img`
width: 60%;
margin: 0 auto;`

const StyledButtonSpan = styled.span`
color: #fff;
font-family: 'Roboto', sans-serif;
font-size: 12px;
font-weight: 200;
text-align: center;
margin: 3px auto;
`

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
            <StyledButton style={{width:'78px', padding:'5px 12px'}}>
                <StyledButtonImg src={ozon} style={{width:'70%'}}/>
                {/* <StyledButtonSpan></StyledButtonSpan> */}
            </StyledButton>
        </StyledColumn>
    </StyledWrapper>
  )
}
