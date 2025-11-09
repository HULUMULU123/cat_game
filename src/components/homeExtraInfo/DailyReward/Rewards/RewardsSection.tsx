import styled from "styled-components";

import type { DailyRewardResponse } from "../../../../shared/api/types";
import RewardsList from "./RewardsList";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
`;

const StyledTimeSpan = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 10px;
  font-weight: 200;
  color: #c7f7ee;
`;

const Placeholder = styled.div`
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: #c7f7ee;
  text-align: center;
`;

interface RewardsSectionProps {
  rewards: DailyRewardResponse[];
  claimedCount: number;
  nextDay: number;
  loading: boolean;
  error: string | null;
  nextUpdateHint: string | null;
}

export default function RewardsSection({
  rewards,
  claimedCount,
  nextDay,
  loading,
  error,
  nextUpdateHint,
}: RewardsSectionProps) {
  if (loading) return <Placeholder>Загрузка наград...</Placeholder>;
  if (error) return <Placeholder>{error}</Placeholder>;
  if (!rewards.length)
    return <Placeholder>Награды ещё не настроены</Placeholder>;

  return (
    <StyledWrapper>
      {nextUpdateHint ? <StyledTimeSpan>{nextUpdateHint}</StyledTimeSpan> : null}
      <RewardsList rewards={rewards} claimedCount={claimedCount} nextDay={nextDay} />
    </StyledWrapper>
  );
}
