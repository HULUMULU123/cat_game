import React from 'react'
import styled from 'styled-components'
import logo from '../../../assets/rules_icons/logo.svg'
const StyledWrapper = styled.div`
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  height: 20vh;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0) 100%
  );

  display: flex;
  justify-content: center; /* центрируем по горизонтали */
`;

const StyledIcon = styled.img`
  position: absolute;
  bottom: 10vh;   /* отступ от низа экрана */
  transform: translateY(50%); /* чтобы чуть скорректировать визуально */
  height: 40px;   /* пример размера, можно менять */
`;

export default function DarkLayoutIcon() {
  return (
    <StyledWrapper>
      <StyledIcon src={logo} alt="icon" />
    </StyledWrapper>
  );
}

