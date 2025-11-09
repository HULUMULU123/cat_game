import styled from "styled-components";
import type { RuleCategory } from "../../home/types";

const StyledRulesItem = styled.li`
  height: 50px;
  list-style: none;
`;

const StyledRuleImg = styled.img`
  width: 30px;
`;

const StyledRuleText = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 8px;
  text-align: center;
  color: var(--color-white-text);
`;

const StyledButton = styled.button`
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

interface RulesItemProps {
  icon: string;
  category: RuleCategory;
  handleClick: (category: RuleCategory) => void;
}

const RulesItem = ({ icon, category, handleClick }: RulesItemProps) => (
  <StyledRulesItem>
    <StyledButton
      type="button"
      onClick={() => handleClick(category)}
    >
      <StyledRuleImg src={icon} alt={category.text} />
      <StyledRuleText>{category.text}</StyledRuleText>
    </StyledButton>
  </StyledRulesItem>
);

export default RulesItem;
