import styled from "styled-components";
import RulesHeader from "./RulesHeader";
import ModalName from "../common/ModalName";

import RulesContent from "./RulesContent";
import type { RulesContentProps } from "./RulesContent";
import data from "../../../assets/data/stakan_rules.json";
import type { RuleCategory } from "../../home/types";

import DarkLayoutIcon from "./DarkLayoutIcon";

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100vh;
`;

interface OpenRuleModalProps {
  handleClose: () => void;
  ruleCategory: RuleCategory;
}

const rulesData = data as Record<RuleCategory, RulesContentProps["rulesData"]>;

const OpenRuleModal = ({ handleClose, ruleCategory }: OpenRuleModalProps) => {
  const selectedRules = rulesData[ruleCategory];

  if (!selectedRules) {
    return (
      <StyledWrapper>
        <RulesHeader handleClose={handleClose} />
        <ModalName textName={ruleCategory.toUpperCase()} />
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <RulesHeader handleClose={handleClose} />
      <ModalName textName={ruleCategory.toUpperCase()} />
      <RulesContent rulesData={selectedRules} />
      <DarkLayoutIcon />
    </StyledWrapper>
  );
};

export default OpenRuleModal;
