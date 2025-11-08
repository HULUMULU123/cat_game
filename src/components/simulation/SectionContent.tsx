import styled from "styled-components";
import coin from "../../assets/coin.png";

const StyledWrapper = styled.div`
  width: 95%;
  border-radius: 7px;
  background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
  padding: 40px 0 20px 0;
  margin: 0 auto;
  margin-top: 10px;
  backdrop-filter: blur(10px);
`;

const StyledContentWrapper = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
`;

const StyledTextP = styled.p`
  padding: 0;
  margin: 0;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  color: rgb(168, 211, 205);
  letter-spacing: 1.2px;
  line-height: 1.5;
`;

const StyledTextSpan = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 10px;
  margin: 20px auto 10px auto;
  color: rgb(134, 180, 173);
`;

const StyledButton = styled.button`
  display: flex;
  border: none;
  background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.7) 0%, rgba(119, 162, 148, 0.5) 50%);
  padding: 7px 50px;
  border-radius: 7px;
  font-family: "Conthrax", sans-serif;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledCoinImg = styled.img`
  width: 23px;
  height: 23px;
`;

interface SectionContentProps {
  description: string;
  cost: number;
  onStart: () => void;
  isDisabled: boolean;
  onPracticeStart?: () => void;
  isPracticeDisabled?: boolean;
  practiceLabel?: string;
}
const PracticeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
  gap: 8px;
`;

const PracticeHint = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(199, 247, 238, 0.72);
  text-transform: uppercase;
`;

const PracticeButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-family: "Conthrax", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0e4f45;
  background: linear-gradient(216deg, rgba(76, 204, 181, 0.9) 0%, rgba(168, 244, 219, 0.7) 50%);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(31, 255, 227, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const SectionContent = ({
  description,
  cost,
  onStart,
  isDisabled,
  onPracticeStart,
  isPracticeDisabled,
  practiceLabel = "Пробный сбой",
}: SectionContentProps) => (
  <StyledWrapper>
    <StyledContentWrapper>
      <StyledTextP style={{ marginBottom: "5px" }}>
        «СИМУЛЯЦИЯ» — тренажёр, имитирующий сбой. Здесь вы можете тренироваться в любое время.
      </StyledTextP>
      <StyledTextP>{description}</StyledTextP>
      <StyledTextSpan>Запустить симуляцию</StyledTextSpan>
      <StyledButton type="button" onClick={onStart} disabled={isDisabled}>
        <StyledCoinImg src={coin} alt="coin" />
        {cost}
      </StyledButton>

      {onPracticeStart ? (
        <PracticeWrapper>
          <PracticeHint>Тренировка без списания монет</PracticeHint>
          <PracticeButton
            type="button"
            onClick={onPracticeStart}
            disabled={Boolean(isPracticeDisabled)}
          >
            {practiceLabel}
          </PracticeButton>
        </PracticeWrapper>
      ) : null}
    </StyledContentWrapper>
  </StyledWrapper>
);

export default SectionContent;
