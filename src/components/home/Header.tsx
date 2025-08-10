import React from "react";
import styled from "styled-components";
import gift from "../../assets/icons/gift.svg";
import rules from "../../assets/icons/rules.svg";
const StyledWrapper = styled.div`
  display: flex;
`;

const StyledInfo = styled.div`
  display: flex;
`;

const StyledUser = styled.div``;

const StyledButton = styled.button``;

const StyledIcon = styled.img``;

const StyledUserImg = styled.image``;

const StyledUserTextWrapper = styled.div``;
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
      </StyledUser>
    </StyledWrapper>
  );
}
