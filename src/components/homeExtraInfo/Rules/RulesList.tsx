import styled from "styled-components";
import RulesItem from "./RulesItem";
import clock from "../../../assets/rules_icons/clock.svg";
import drops from "../../../assets/rules_icons/drops.svg";
import gift from "../../../assets/rules_icons/gift.svg";
import logoCircle from "../../../assets/rules_icons/logo_circle.svg";
import logo from "../../../assets/rules_icons/logo.svg";
import money from "../../../assets/rules_icons/money.svg";
import points from "../../../assets/rules_icons/points.svg";
import rightText from "../../../assets/rules_icons/right_text.svg";
import alert from "../../../assets/rules_icons/alert.svg";
import type { RuleCategory } from "../../home/types";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  margin: 20px auto;
  gap: 15px;
`;

const StyledListHeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 90%;
`;

const StyledLine = styled.span`
  display: block;
  width: 100%;
  height: 1px;
  background: #85fff0;
  border-radius: 10px;
`;

const StyledHeadingSpan = styled.span`
  color: #fff;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
`;

const StyledRulesList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  padding: 0;
  margin: 0;
  width: 95%;
`;

interface RulesListProps {
  openRuleCategory: (category: RuleCategory) => void;
}

const RulesList = ({ openRuleCategory }: RulesListProps) => (
  <StyledWrapper>
    <StyledListHeadingWrapper>
      <StyledHeadingSpan>КАТЕГОРИИ</StyledHeadingSpan>
      <StyledLine />
    </StyledListHeadingWrapper>
    <StyledRulesList>
      <RulesItem handleClick={openRuleCategory} icon={logo} text="СТАКАН" />
      <RulesItem handleClick={openRuleCategory} icon={drops} text="СБОЙ" />
      <RulesItem
        handleClick={openRuleCategory}
        icon={logoCircle}
        text="CRASH"
      />
      <RulesItem
        handleClick={openRuleCategory}
        icon={rightText}
        text="УСЛОВИЯ УЧАСТИЯ"
      />
      <RulesItem handleClick={openRuleCategory} icon={gift} text="АНОМАЛИЯ" />
      <RulesItem
        handleClick={openRuleCategory}
        icon={alert}
        text="ЗАПРЕЩЕННЫЕ ДЕЙСТВИЯ"
      />
      <RulesItem
        handleClick={openRuleCategory}
        icon={money}
        text="ПЕРЕДАЧА МАТЕРИАЛЬНОГО АНАЛОГА"
      />
      <RulesItem
        handleClick={openRuleCategory}
        icon={clock}
        text="ТУРНИРЫ И ТАЙМЕРЫ"
      />
      <RulesItem
        handleClick={openRuleCategory}
        icon={points}
        text="ДОПОЛНИТЕЛЬНО"
      />
    </StyledRulesList>
  </StyledWrapper>
);

export default RulesList;
