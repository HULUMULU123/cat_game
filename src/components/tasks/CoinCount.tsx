import styled from 'styled-components'
import coin from '../../assets/coin.png'

const StyledContentWrapper = styled.div`
display:flex;
width: 100%;
padding: 15px 20px;
`

const StyledCoinWrapper = styled.div`
display:flex;
gap: 10px;
align-items: center;
`

const StyledCoinCount = styled.span`
font-size: 16px;
font-family: 'Conthrax', sans-serif;
color: #E1FFFB;
font-weight: 700;
`

const StyledCoinImg = styled.img`
width:30px;
height: 30px;`

export default function CoinCount() {
  return (
    <StyledContentWrapper>
        <StyledCoinWrapper>
            <StyledCoinImg src={coin}/>
            <StyledCoinCount>500</StyledCoinCount>
        </StyledCoinWrapper>
    </StyledContentWrapper>
  )
}
