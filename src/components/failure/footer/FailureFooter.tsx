import React from "react";
import styled from "styled-components";
import failure_bottom from "../../../assets/failure_bottom.png";
import BounusList, { BonusListEntry } from "./BounusList";
import type { FailureBonusType } from "../../../shared/api/types";

const Wrapper = styled.div<{ $hasBonuses: boolean }>`
  height: ${({ $hasBonuses }) => ($hasBonuses ? "30vh" : "24vh")};
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-top: ${({ $hasBonuses }) => ($hasBonuses ? "24px" : "48px")};
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  box-sizing: border-box;
`;

const LightLine = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  width: 100%;
  height: 2px;
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(133, 255, 196);
  box-shadow: 0px -9px 18px 6px rgba(133, 255, 196, 0.7);
  -webkit-box-shadow: 0px -9px 18px 6px rgba(133, 255, 196, 0.7);
  -moz-box-shadow: 0px -9px 18px 6px rgba(133, 255, 196, 0.7);
`;

const BottomWrapper = styled.div`
  width: 100%;
  position: relative;
  margin-top: auto;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledScroreWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StyledScoreSpan = styled.span`
  color: #fff;
  font-size: 40px;
  font-family: 'Conthrax', sans-serif;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(44, 194, 169, 0.8),
               0 0 16px rgba(44, 194, 169, 0.6);
`;

const StyledScoreInfo = styled.span`
  color: #e1fffb;
  font-size: 12px;
  font-family: "Conthrax", sans-serif;
  font-weight: 700;
`;

const StyledBottomImg = styled.img`
  width: 100%;
  display: block;
`;

interface FailureFooterProps {
  score: number;
  bonuses?: BonusListEntry[];
  onBonusActivate?: (type: FailureBonusType) => void;
}

export default function FailureFooter({
  score,
  bonuses = [],
  onBonusActivate,
}: FailureFooterProps) {
  const hasBonuses = bonuses.length > 0;
  const formattedScore = score.toLocaleString("ru-RU");

  return (
    <Wrapper $hasBonuses={hasBonuses}>
      <LightLine $visible={hasBonuses}></LightLine>
      <BounusList bonuses={bonuses} onActivate={onBonusActivate} />
      <BottomWrapper>
        <ImageWrapper>
          <StyledBottomImg src={failure_bottom} />
          <StyledScroreWrapper>
            <StyledScoreSpan>{formattedScore}</StyledScoreSpan>
            <StyledScoreInfo>капель собрано</StyledScoreInfo>
          </StyledScroreWrapper>
        </ImageWrapper>
      </BottomWrapper>
    </Wrapper>
  )
}
