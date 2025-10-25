import { MouseEvent } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import gift from "../../assets/icons/gift.svg";
import type { HomeModalType } from "./types";

const StyledActionBtn = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 90px;
  padding: 7px 30px;
  background: #fff;
  box-shadow: 1px 3px 6px 0px rgba(0, 255, 174, 0.3);
  -webkit-box-shadow: 1px 3px 6px 0px rgba(0, 255, 174, 0.3);
  -moz-box-shadow: 1px 3px 6px 0px rgba(0, 255, 174, 0.3);
  display: flex;
  width: 70%;
  max-width: 50vh;
  border-radius: 7px;
  border: none;
  cursor: pointer;

  @media (max-width: 370px) {
    width: 80%;
  }
`;

const StyledActionContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const StyledActionTextWrapper = styled.div`
  margin: 0 auto;
  font-family: "Conthrax", sans-serif;
`;

const StyledActionName = styled.span`
  display: block;
  text-align: center;
  color: #1a9480;
  font-size: 12px;

  @media (max-width: 370px) {
    font-size: 10px;
  }
`;

const StyledActionTimer = styled.span`
  display: block;
  text-align: center;
  color: #1a9480;
  font-size: 28px;
  font-weight: 700;

  @media (max-width: 370px) {
    font-size: 20px;
  }
`;

const StyledGiftWrapper = styled.button`
  position: absolute;
  top: -20px;
  right: -20%;
  background: #2cc295;
  border-radius: 7px;
  display: flex;
  padding: 7px 15px;
  border: none;
  cursor: pointer;
`;

const StyledGiftImg = styled.img`
  width: 100%;
  margin: 0 auto;
`;

interface MainActionProps {
  onOpenModal: (modalType: HomeModalType) => void;
}

const MainAction = ({ onOpenModal }: MainActionProps) => {
  const navigate = useNavigate();

  const handleGiftClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpenModal("prize");
  };

  return (
    <StyledActionBtn type="button" onClick={() => navigate("/failure")}>
      <StyledActionContentWrapper>
        <StyledActionTextWrapper>
          <StyledActionName>СБОЙ НАЧАЛСЯ :</StyledActionName>
          <StyledActionTimer>03 : 59 : 58</StyledActionTimer>
        </StyledActionTextWrapper>
        <StyledGiftWrapper type="button" onClick={handleGiftClick}>
          <StyledGiftImg src={gift} alt="Gift" />
        </StyledGiftWrapper>
      </StyledActionContentWrapper>
    </StyledActionBtn>
  );
};

export default MainAction;
