import styled from "styled-components";

import type { DailyRewardResponse } from "../../../../shared/api/types";
import RewardsItem from "./RewardsItem";

const StyledList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0;
  margin: 0;
  width: 95%;

  @media (max-width: 540px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

interface RewardsListProps {
  rewards: DailyRewardResponse[];
  claimedCount: number;
  nextDay: number;
}

const getStatus = (
  day: number,
  claimedCount: number,
  nextDay: number
): "claimed" | "next" | "locked" => {
  if (day <= claimedCount) return "claimed";
  if (nextDay <= 7 && day === nextDay) return "next";
  return "locked";
};

export default function RewardsList({
  rewards,
  claimedCount,
  nextDay,
}: RewardsListProps) {
  if (!rewards.length) return null;

  const sorted = [...rewards].sort((a, b) => a.day_number - b.day_number);
  const regular = sorted.filter((item) => item.day_number <= 7);

  return (
    <StyledList>
      {regular.map((reward) => (
        <RewardsItem
          key={reward.day_number}
          dayNumber={reward.day_number}
          rewardAmount={reward.reward_amount}
          status={getStatus(reward.day_number, claimedCount, nextDay)}
        />
      ))}
    </StyledList>
  );
}
