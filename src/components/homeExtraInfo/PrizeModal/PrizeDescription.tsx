import styled from "styled-components";

const StyledWrapper = styled.div`
  width: 95%;
  margin: 15px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Conthrax", sans-serif;
  gap: 20px;
  color: rgb(157, 185, 181);
`;

const StyledDescription = styled.p`
  width: 85%;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const StyledMeta = styled.div`
  width: 85%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
`;

const StyledMetaItem = styled.span`
  white-space: nowrap;
`;

interface PrizeDescriptionProps {
  description: string | null;
  currentDate: string;
  rewardCoins: number | null;
}

export default function PrizeDescription({
  description,
  currentDate,
  rewardCoins,
}: PrizeDescriptionProps) {
  const displayDescription =
    description?.trim() ||
    "В каждом сбое победитель получает ценные призы — участвуйте и выигрывайте!";

  const rewardText =
    typeof rewardCoins === "number"
      ? `Награда: +${new Intl.NumberFormat("ru-RU").format(rewardCoins)} монет`
      : null;

  return (
    <StyledWrapper>
      <StyledDescription>{displayDescription}</StyledDescription>
      <StyledMeta>
        <StyledMetaItem>{currentDate}</StyledMetaItem>
        {rewardText ? <StyledMetaItem>{rewardText}</StyledMetaItem> : null}
      </StyledMeta>
    </StyledWrapper>
  );
}
