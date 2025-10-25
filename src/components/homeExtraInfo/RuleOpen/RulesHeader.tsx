import styled from "styled-components";
import rules from "../../../assets/icons/rules.svg";
import HeaderCloseBtn from "../common/HeaderCloseBtn";

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 85%;
  padding: 15px 20px;
  margin: 0 auto;
`;

const StyledIconWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StyledModalImg = styled.img`
  width: 25px;
  height: 25px;
`;

interface RulesHeaderProps {
  handleClose: () => void;
}

const RulesHeader = ({ handleClose }: RulesHeaderProps) => (
  <StyledHeader>
    <StyledIconWrapper>
      <StyledModalImg src={rules} alt="Rules" />
    </StyledIconWrapper>
    <HeaderCloseBtn handleClose={handleClose} />
  </StyledHeader>
);

export default RulesHeader;
