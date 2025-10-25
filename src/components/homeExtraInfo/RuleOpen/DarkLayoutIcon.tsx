import styled from "styled-components";
import logo from "../../../assets/rules_icons/logo.svg";

const StyledWrapper = styled.div`
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  height: 20vh;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  display: flex;
  justify-content: center;
`;

const StyledIcon = styled.img`
  position: absolute;
  bottom: 10vh;
  transform: translateY(50%);
  height: 40px;
`;

const DarkLayoutIcon = () => (
  <StyledWrapper>
    <StyledIcon src={logo} alt="STAKAN" />
  </StyledWrapper>
);

export default DarkLayoutIcon;
