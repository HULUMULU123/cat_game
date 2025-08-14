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
  width: 88%;
  margin: 0 auto;
  padding: 21px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const StyledCoinWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
`
const StyledCoinImg = styled.img`
  width: 37px;
  `

const StyledCoinCount = styled.span`
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
  font-size: 30px;
  color: #fff;
  `

const StyledCoinLine = styled.span`
  display:block;
  width:100%;
  height:1px;
  border-radius:5px;
  background: #85FFF0;
  box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
  -webkit-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
  -moz-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
  `

const StyledCoinName = styled.span`
  margin-left: auto;
  font-family: 'Roboto', sans-serif;
  font-weight: 100;
  font-size: 14px;
  color: #fff;
`

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
