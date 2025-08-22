import styled from "styled-components"
import RewardsList from "./RewardsList"

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 5px;
margin: 7px 0;
`

const StyledTimeSpan = styled.span``


export default function RewardsSection() {
  return (
    <StyledWrapper>
        <StyledTimeSpan>До обновления награды: 16 h 51 m</StyledTimeSpan>
        <RewardsList/>
    </StyledWrapper>
  )
}
