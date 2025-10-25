import styled from "styled-components";
import cross from "../../../assets/icons/cancel.svg";

const StyledBtnWrapper = styled.div`
  display: flex;
  height: 100%;
`;

const StyledBtn = styled.button`
  margin: auto;
  border: none;
  background: transparent;
  height: 25px;
  width: 25px;
  cursor: pointer;
`;

const StyledBtnImg = styled.img`
  width: 100%;
  height: 100%;
`;

interface HeaderCloseBtnProps {
  handleClose: () => void;
}

const HeaderCloseBtn = ({ handleClose }: HeaderCloseBtnProps) => (
  <StyledBtnWrapper>
    <StyledBtn type="button" onClick={handleClose}>
      <StyledBtnImg src={cross} alt="Закрыть" />
    </StyledBtn>
  </StyledBtnWrapper>
);

export default HeaderCloseBtn;
