import styled from "styled-components";

const StyledWrapperDate = styled.div`
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-family: "Conthrax", sans-serif;
  font-weight: 800;
`;

const StyledSmallDate = styled.span`
  color: rgb(158, 185, 181);
  font-size: 12px;
`;

const StyledBigDate = styled.span`
  font-size: 28px;
  color: var(--color-white-text);
`;

interface TodayDateProps {
  currentDate: string;
  currentDay: number;
  totalDays: number;
}

export default function TodayDate({
  currentDate,
  currentDay,
  totalDays,
}: TodayDateProps) {
  const safeCurrent = Math.max(0, Math.min(currentDay, totalDays));

  return (
    <StyledWrapperDate>
      <StyledSmallDate>{currentDate}</StyledSmallDate>
      <StyledBigDate>
        {safeCurrent} / {totalDays}
      </StyledBigDate>
    </StyledWrapperDate>
  );
}
