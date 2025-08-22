import React from "react";
import styled from "styled-components";
import gift from "../../assets/icons/gift.svg";
import rules from "../../assets/icons/rules.svg";
import avatar from "../../assets/avatar.jpg"
const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 23px;
`;

const StyledInfo = styled.div`
  display: flex;
  
`;

const StyledUser = styled.div`
  display:flex;`;

const StyledButton = styled.button`
  border: none;
  background: transparent;
  &:nth-child(2) {
      margin-left: 16px;
    }
`;


const StyledIcon = styled.img``;

const StyledUserImgWrapper = styled.div`
  width:35px;
  height:35px;
  overflow: hidden;
  border-radius:50%;
  border: 2px solid #85FFF0;
  box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
  -webkit-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
  -moz-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
`

const StyledUserImg = styled.img`
  width:100%;
`;

const StyledUserTextWrapper = styled.div`
display:flex;
flex-direction:column;

text-align:right;
margin-right:11px;`;
const StyledUserText = styled.span`
color: rgba(255,255,255,0.5);
font-size: 14px;
font-weight: 300;
&:nth-child(2) {
      color: rgba(255,255,255,1);
    }
`;
export default function Header({setInfoType}) {
  return (
    <StyledWrapper>
      <StyledInfo>
        <StyledButton onClick={()=>setInfoType('rules')}>
          <StyledIcon src={rules} />
        </StyledButton>
        <StyledButton onClick={()=>setInfoType('reward')}>
          <StyledIcon src={gift} />
        </StyledButton>
      </StyledInfo>
      <StyledUser onClick={()=>setInfoType('user')}>
        <StyledUserTextWrapper>
          <StyledUserText>Good Evening,</StyledUserText>
          <StyledUserText>Alex!</StyledUserText>
        </StyledUserTextWrapper>
        <StyledUserImgWrapper>
          <StyledUserImg src={avatar}/>
        </StyledUserImgWrapper>
      </StyledUser>
    </StyledWrapper>
  );
}
