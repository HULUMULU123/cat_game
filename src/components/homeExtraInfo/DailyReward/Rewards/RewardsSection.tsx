import styled from "styled-components"
import RewardsList from "./RewardsList"

const StyledWrapper = styled.div``

const StyledTimeSpan = styled.span``


export default function RewardsSection() {
  return (
    <StyledWrapper>
        <StyledTimeSpan>До обновления награды: 16 h 51 m</StyledTimeSpan>
        <RewardsList/>
    </StyledWrapper>
  )
}
