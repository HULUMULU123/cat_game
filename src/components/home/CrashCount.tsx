import styled from "styled-components"
import bg from '../../assets/Rectangle 31.svg';
import coin from '../../assets/coin.png'
const StyledWrapper = styled.div`
  width: 95%;
  height: 100px;
  background-image: url(${bg});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto;
`;

const StyledContentWrapper = styled.div`
  width: 90%;
  margin: 18px auto 9px auto;
`
const StyledCoinWrapper = styled.div`
  display:flex;
`
const StyledCoinImg = styled.img`
  width: 37px;
  `

const StyledCoinCount = styled.span``

const StyledCoinLine = styled.span`
  width:100%;
  height:1px;
  border-radius:5px;
  `

const StyledCoinName = styled.span`
margin-left: auto;`

export default function CrashCount() {
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <StyledCoinWrapper>
          <StyledCoinImg src={coin}/>
          <StyledCoinCount>5 500</StyledCoinCount>
        </StyledCoinWrapper>
        <StyledCoinLine></StyledCoinLine>
        <StyledCoinName>CRASH</StyledCoinName>
      </StyledContentWrapper>
    </StyledWrapper>
  )
}
