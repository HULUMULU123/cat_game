import styled from "styled-components";
import { resolveMediaUrl } from "../../../shared/api/urls";

const StyledWrapper = styled.div`
  width: 95%;
  display: flex;
  margin: 15px auto;
  gap: 10px;
  flex-direction: column;
  align-items: center;
`;

const StyledPrizeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: 260px;
  max-height: 420px;
  height: clamp(260px, 55vw, 420px);
  border-radius: 7px;
  overflow: hidden;
  background: linear-gradient(
    216deg,
    rgba(18, 99, 88, 0.4) 50%,
    rgba(119, 162, 148, 0.2) 100%
  );
`;

const StyledPrizeImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const StyledEmptyPrize = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: rgb(224, 255, 251);
`;

const StyledTimerInfo = styled.div`
  position: absolute;
  width: 70%;
  background: #fff;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #1a9480;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Conthrax", sans-serif;
  padding: 8px 12px;
  text-align: center;
`;

const StyledTextSpan = styled.span`
  font-size: 10px;
  font-weight: 600;
`;

const StyledTimerSpan = styled.span`
  font-size: 20px;
  font-weight: 700;
`;

const StyledCompletionNote = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #e85b5b;
`;

const StyledPrizeName = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: rgb(116, 145, 140);
  text-align: center;
  text-transform: uppercase;
`;

const StyledLine = styled.span`
  display: flex;
  width: 100%;
  height: 1px;
  border-radius: 10px;
  background: #85fff0;
`;

interface PrizeCardProps {
  mainPrizeTitle: string | null;
  mainPrizeImage: string | null;
  timerLabel: string;
  timerValue: string;
  completionNote: string | null;
}

export default function PrizeCard({
  mainPrizeTitle,
  mainPrizeImage,
  timerLabel,
  timerValue,
  completionNote,
}: PrizeCardProps) {
  const hasPrizeInfo = Boolean(
    mainPrizeTitle?.trim() || mainPrizeImage?.trim()
  );
  const imageSrc = mainPrizeImage ? resolveMediaUrl(mainPrizeImage) : null;
  const prizeName = mainPrizeTitle?.trim();

  return (
    <StyledWrapper>
      <StyledPrizeWrapper>
        {hasPrizeInfo && imageSrc ? (
          <StyledPrizeImg src={imageSrc} alt={prizeName ?? "Главный приз"} />
        ) : null}
        {!hasPrizeInfo ? (
          <StyledEmptyPrize>
            Информации по главному призу пока нет
          </StyledEmptyPrize>
        ) : null}
        <StyledTimerInfo>
          <StyledTextSpan>{timerLabel}</StyledTextSpan>
          {timerValue ? <StyledTimerSpan>{timerValue}</StyledTimerSpan> : null}
          {!timerValue && !completionNote ? (
            <StyledTimerSpan as="span">—</StyledTimerSpan>
          ) : null}
          {completionNote ? (
            <StyledCompletionNote>{completionNote}</StyledCompletionNote>
          ) : null}
        </StyledTimerInfo>
      </StyledPrizeWrapper>
      <StyledPrizeName>
        {prizeName ?? "Информации по главному призу пока нет"}
      </StyledPrizeName>
      <StyledLine />
    </StyledWrapper>
  );
}
