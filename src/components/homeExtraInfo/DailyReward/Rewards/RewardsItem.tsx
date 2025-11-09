import styled from "styled-components";
import drop from "../../../../assets/icons/drop.svg";

const StyledListItem = styled.li<{ $status: "claimed" | "next" | "locked" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: ${({ $status }) => ($status === "locked" ? 0.5 : 1)};
`;

const StyledItemContent = styled.div<{ $status: "claimed" | "next" | "locked" }>`
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 14px 0;
  border-radius: 7px;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  border: ${({ $status }) =>
    $status === "next" ? "1px solid rgba(133, 255, 240, 0.8)" : "1px solid transparent"};
`;

const StyledContentImg = styled.img`
  width: 28px;
  height: 28px;
`;

const StyledContentSpan = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-white-text);
`;

const StyledDayLabel = styled.span`
  font-size: 12px;
  font-weight: 300;
  color: rgb(113, 143, 139);
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
`;

interface RewardsItemProps {
  dayNumber: number;
  rewardAmount: number;
  status: "claimed" | "next" | "locked";
}

export default function RewardsItem({
  dayNumber,
  rewardAmount,
  status,
}: RewardsItemProps) {
  return (
    <StyledListItem $status={status}>
      <StyledItemContent $status={status}>
        <StyledContentImg src={drop} alt="капля" />
        <StyledContentSpan>+{rewardAmount}</StyledContentSpan>
      </StyledItemContent>
      <StyledDayLabel>День {dayNumber}</StyledDayLabel>
    </StyledListItem>
  );
}
