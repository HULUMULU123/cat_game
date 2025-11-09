import styled from "styled-components";
import PrizeHeader from "../PrizeModal/PrizeHeader";
import RewardHeader from "../DailyReward/RewardHeader";

const StyledContentWrapper = styled.div`
  display: flex;
  width: 85%;
  padding: 15px 20px;
  justify-content: space-between;
  margin: 0 auto;
`;

interface HeaderProps {
  infoType?: "prize" | "reward" | null;
  handleClose: () => void;
  prizeBalance?: number;
}

export default function Header({
  infoType = null,
  handleClose,
  prizeBalance,
}: HeaderProps) {
  return (
    <StyledContentWrapper>
      {infoType === "prize" ? (
        <PrizeHeader handleClose={handleClose} balance={prizeBalance} />
      ) : null}
      {infoType === "reward" ? (
        <RewardHeader handleClose={handleClose} />
      ) : null}
    </StyledContentWrapper>
  );
}
