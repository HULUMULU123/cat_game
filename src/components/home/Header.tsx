import React from "react";
import styled from "styled-components";
import gift from "../../assets/icons/gift.svg";
import rules from "../../assets/icons/rules.svg";
import avatar from "../../assets/avatar.jpg"
const StyledWrapper = styled.div`
  display: flex;
`;

const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 23px;
`;

const StyledUser = styled.div``;

const StyledButton = styled.button`
border: none;
background: transparent;
&:nth-child(2) {
    margin-left: 34px;
  }
`;


const StyledIcon = styled.img``;

const StyledUserImg = styled.img``;

const StyledUserTextWrapper = styled.div`
display:flex;
flex-direction:column;
justify-content:right`;
const StyledUserText = styled.span``;
export default function Header() {
  return (
    <StyledWrapper>
      <StyledInfo>
        <StyledButton>
          <StyledIcon src={rules} />
        </StyledButton>
        <StyledButton>
          <StyledIcon src={gift} />
        </StyledButton>
      </StyledInfo>
      <StyledUser>
        <StyledUserTextWrapper>
          <StyledUserText>Good Evening,</StyledUserText>
          <StyledUserText>Alex!</StyledUserText>
        </StyledUserTextWrapper>
        <StyledUserImg src={avatar}/>
      </StyledUser>
    </StyledWrapper>
  );
}
