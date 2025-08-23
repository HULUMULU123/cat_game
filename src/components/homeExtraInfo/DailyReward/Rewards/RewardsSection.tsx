import styled from "styled-components"
import RewardsList from "./RewardsList"

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 10px;
margin: 10px 0;
`

const StyledTimeSpan = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 10px;
color: #353f3a;
font-weight: 200;`


export default function RewardsSection() {
  return (
    <StyledWrapper>
        <StyledTimeSpan>До обновления награды: 16 h 51 m</StyledTimeSpan>
        <RewardsList/>
    </StyledWrapper>
  )
}
