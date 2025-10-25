import styled from "styled-components";
import gift from "../../assets/icons/gift.svg";
import rules from "../../assets/icons/rules.svg";
import avatar from "../../assets/avatar.jpg";
import useGlobalStore from "../../shared/store/useGlobalStore";
import type { HomeModalType } from "./types";

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  padding: 16px 23px;
`;

const StyledInfo = styled.div`
  display: flex;
`;

const StyledUser = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const StyledButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;

  &:nth-child(2) {
    margin-left: 16px;
  }
`;

const StyledIcon = styled.img``;

const StyledUserImgWrapper = styled.div`
  width: 35px;
  height: 35px;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #85fff0;
  box-shadow: -1px -1px 18px 0px rgba(133, 255, 240, 0.75);
  -webkit-box-shadow: -1px -1px 18px 0px rgba(133, 255, 240, 0.75);
  -moz-box-shadow: -1px -1px 18px 0px rgba(133, 255, 240, 0.75);
`;

const StyledUserImg = styled.img`
  width: 100%;
`;

const StyledUserTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;
  margin-right: 11px;
`;

const StyledUserText = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 300;

  &:nth-child(2) {
    color: rgba(255, 255, 255, 1);
  }
`;

interface HeaderProps {
  onOpenModal: (modalType: HomeModalType) => void;
}

const Header = ({ onOpenModal }: HeaderProps) => {
  const userData = useGlobalStore((state) => state.userData);

  return (
    <StyledWrapper>
      <StyledInfo>
        <StyledButton onClick={() => onOpenModal("rules")}>
          <StyledIcon src={rules} alt="Rules icon" />
        </StyledButton>
        <StyledButton onClick={() => onOpenModal("reward")}>
          <StyledIcon src={gift} alt="Rewards icon" />
        </StyledButton>
      </StyledInfo>
      <StyledUser type="button" onClick={() => onOpenModal("user")}>
        <StyledUserTextWrapper>
          <StyledUserText>Good Evening,</StyledUserText>
          <StyledUserText>{userData?.first_name || ""}!</StyledUserText>
        </StyledUserTextWrapper>
        <StyledUserImgWrapper>
          <StyledUserImg
            src={userData?.photo_url || avatar}
            alt="User avatar"
          />
        </StyledUserImgWrapper>
      </StyledUser>
    </StyledWrapper>
  );
};

export default Header;
