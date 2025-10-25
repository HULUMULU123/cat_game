import styled from "styled-components";
import RulesHeader from "./RulesHeader";
import ModalName from "../common/ModalName";
import RulesList from "./RulesList";
import { RuleCategory } from "../../home/types";

const StyledWrapper = styled.div`
  width: 100%;
`;

interface RulesModalProps {
  handleClose: () => void;
  openRuleCategory: (category: RuleCategory) => void;
}

const RulesModal = ({ handleClose, openRuleCategory }: RulesModalProps) => (
  <StyledWrapper>
    <RulesHeader handleClose={handleClose} />
    <ModalName textName="ПРАВИЛА STAKAN" />
    <RulesList openRuleCategory={openRuleCategory} />
  </StyledWrapper>
);

export default RulesModal;
