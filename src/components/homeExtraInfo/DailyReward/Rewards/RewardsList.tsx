import styled from "styled-components"
import RewardsItem from "./RewardsItem"

const StyledList = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
`




export default function RewardsList() {
  return (
    <StyledList>
        <RewardsItem/>
        <RewardsItem/>
        <RewardsItem/>
        <RewardsItem/>
        <RewardsItem/>
        <RewardsItem/>
    </StyledList>
  )
}
