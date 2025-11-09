import styled from "styled-components";

import coin from "../../../../assets/coin.png";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;
  margin: 24px auto;
  gap: 7px;
`;

const StyledHeaderSpan = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgb(156, 154, 148);
`;

const StyledSpecialWrapper = styled.div<{ $status: "claimed" | "next" | "locked" }>`
  width: 100%;
  border-radius: 7px;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 5px;
  border: ${({ $status }) =>
    $status === "next" ? "1px solid rgba(133, 255, 240, 0.8)" : "1px solid transparent"};
  opacity: ${({ $status }) => ($status === "locked" ? 0.5 : 1)};
`;

const StyledContentImg = styled.img`
  width: 36px;
  height: 36px;
`;

const StyledContentSpan = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 24px;
  color: var(--color-white-text);
`;

const StyledBottomDate = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 200;
  color: rgb(113, 140, 135);
  text-align: center;
`;

interface SpecialRewardsProps {
  rewardAmount: number | null;
  status: "claimed" | "next" | "locked";
  lastClaimDate: string | null;
}

const buildStatusText = (
  status: "claimed" | "next" | "locked",
  lastClaimDate: string | null
) => {
  if (status === "claimed" && lastClaimDate) {
    return `Получено ${new Date(lastClaimDate).toLocaleDateString("ru-RU")}`;
  }
  if (status === "next") {
    return "Доступно после получения 7 наград";
  }
  return "Получайте награды 7 дней подряд";
};

export default function SpecialRewards({
  rewardAmount,
  status,
  lastClaimDate,
}: SpecialRewardsProps) {
  const amount = typeof rewardAmount === "number" ? rewardAmount : 0;
  const footerText = buildStatusText(status, lastClaimDate);

  return (
    <StyledWrapper>
      <StyledHeaderSpan>СПЕЦИАЛЬНЫЙ ПРИЗ</StyledHeaderSpan>
      <StyledSpecialWrapper $status={status}>
        <StyledContentImg src={coin} alt="монеты" />
        <StyledContentSpan>+{amount}</StyledContentSpan>
      </StyledSpecialWrapper>
      <StyledBottomDate>{footerText}</StyledBottomDate>
    </StyledWrapper>
  );
}
