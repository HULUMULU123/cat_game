import styled from "styled-components";
import { RuleCategory } from "../../home/types";

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
  text: string;
  handleClick: (category: RuleCategory) => void;
}

const RulesItem = ({ icon, text, handleClick }: RulesItemProps) => {
  const normalizedCategory = text.toLowerCase() as RuleCategory;

  return (
    <StyledRulesItem>
      <StyledButton type="button" onClick={() => handleClick(normalizedCategory)}>
        <StyledRuleImg src={icon} alt={text} />
        <StyledRuleText>{text}</StyledRuleText>
      </StyledButton>
    </StyledRulesItem>
  );
};

export default RulesItem;
