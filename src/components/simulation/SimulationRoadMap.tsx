import React, { useMemo } from "react";
import styled from "styled-components";
import coin from "../../assets/coin.png";

const StyledWrapper = styled.div`
  display: flex;
  position: relative;
  width: 95%;
  height: 100px;
  margin: 0 auto;
`;

const StyledContentWrapper = styled.ul`
  height: 50%;
  padding: 0;
  width: 90%;
  display: flex;
  margin: auto;
  justify-content: space-between;
`;

const StyledLine = styled.span`
  display: block;
  width: 100%;
  height: 2px;
  background: #85fff0;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
`;

const StyledGoalItem = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "Conthrax", sans-serif;
  font-size: 10px;
  font-weight: 700;
`;

const StyledDoneSpan = styled.span`
  display: block;
  color: rgb(134, 180, 173);
`;

const StyledPointSpan = styled.span`
  display: block;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #85fff0;
  margin: 0 auto;
`;

const StyledGoalSpan = styled.span`
  display: flex;
  align-items: center;
  justify-content: right;
  text-align: right;
  color: rgb(224, 255, 251);
`;

const StyledCoinImg = styled.img`
  width: 15px;
  height: 15px;
  margin-left: 10px;
`;

type Props = {
  attemptCost: number; // стоимость запуска симуляции
  reward1: number;
  reward2: number;
  reward3: number;
};

/**
 * Показываем 3 чекпойнта.
 * В примере раньше было "100/260", "200/260", "260/260".
 * Здесь делаем универсально: 1/3, 2/3 и 3/3 от attemptCost.
 * Если нужно иное правило — можно заменить расчёт checkpoints.
 */
export default function SimulationRoadMap({
  attemptCost,
  reward1,
  reward2,
  reward3,
}: Props) {
  const checkpoints = useMemo(() => {
    const c = Math.max(0, attemptCost || 0);
    const c1 = Math.max(1, Math.floor(c / 3));
    const c2 = Math.max(c1 + 1, Math.floor((2 * c) / 3));
    const c3 = c; // финальная цель
    return [c1, c2, c3];
  }, [attemptCost]);

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <StyledGoalItem>
          <StyledDoneSpan>
            {checkpoints[0]} / {attemptCost}
          </StyledDoneSpan>
          <StyledPointSpan />
          <StyledGoalSpan>
            {reward1} <StyledCoinImg src={coin} alt="coin" />
          </StyledGoalSpan>
        </StyledGoalItem>

        <StyledGoalItem>
          <StyledDoneSpan>
            {checkpoints[1]} / {attemptCost}
          </StyledDoneSpan>
          <StyledPointSpan />
          <StyledGoalSpan>
            {reward2} <StyledCoinImg src={coin} alt="coin" />
          </StyledGoalSpan>
        </StyledGoalItem>

        <StyledGoalItem>
          <StyledDoneSpan>
            {checkpoints[2]} / {attemptCost}
          </StyledDoneSpan>
          <StyledPointSpan />
          <StyledGoalSpan>
            {reward3} <StyledCoinImg src={coin} alt="coin" />
          </StyledGoalSpan>
        </StyledGoalItem>
      </StyledContentWrapper>
      <StyledLine />
    </StyledWrapper>
  );
}
