import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import cancel from "../../assets/icons/cancel.svg";

const StyledModalWidnow = styled.div`
  margin: auto;
  display: flex;
  position: relative;
  width: 75%;
  padding: 20px 0;
  background: #28b092;
  border-radius: 7px;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.4s ease;

  &.open {
    transform: translateY(0);
    opacity: 1;
  }
`;

const StyledContentWrapper = styled.div`
  margin: auto;
  width: 90%;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.h3`
  font-family: "Conthrax", sans-serif;
  font-size: 15px;
  color: var(--color-white-text);
  text-align: center;
  font-weight: 700;
`;

const StyledLine = styled.span`
  display: block;
  height: 2px;
  width: 100%;
  background: #85fff0;
  margin-top: 10px;
  border-radius: 10px;
`;

const StyledText = styled.p`
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: var(--color-white-text);
  text-align: center;
  font-weight: 500;
  margin-top: 15px;
`;

const StyledBtn = styled.button`
  background: #44ecd2;
  padding: 5px 10px;
  width: 40%;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 7px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledLoadingText = styled.span`
  margin: 0 auto;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: var(--color-main);
`;

const StyledCloseBtn = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  border: none;
  border-radius: 50%;
  background: rgba(14, 94, 81, 0.5);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
`;

const StyledCloseBtnImg = styled.img`
  width: 14px;
  height: 14px;
`;

const StyledMainText = styled.span`
  display: block;
  margin-top: 12px;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: var(--color-white-text);
`;

interface ModalWindowProps {
  header: string;
  text: string;
  btnContent?: ReactNode;
  mainText?: ReactNode;
  setOpenModal: (value: boolean) => void;
  isOpenModal: boolean;
  onAction?: () => void | Promise<void>;
  isActionLoading?: boolean;
}

const ModalWindow = ({
  header,
  text,
  btnContent,
  mainText,
  setOpenModal,
  isOpenModal,
  onAction,
  isActionLoading = false,
}: ModalWindowProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpenModal) {
      const timer = window.setTimeout(() => setAnimate(true), 50);
      return () => window.clearTimeout(timer);
    }

    setAnimate(false);
    return undefined;
  }, [isOpenModal]);

  return (
    <StyledModalWidnow
      className={animate ? "open" : ""}
      onClick={(event) => event.stopPropagation()}
    >
      <StyledCloseBtn onClick={() => setOpenModal(false)}>
        <StyledCloseBtnImg src={cancel} alt="close" />
      </StyledCloseBtn>
      <StyledContentWrapper>
        <StyledHeader>{header}</StyledHeader>
        <StyledLine />
        <StyledText>{text}</StyledText>
        {btnContent ? (
          <StyledBtn
            type="button"
            onClick={() => {
              if (onAction) {
                void onAction();
              }
            }}
            disabled={isActionLoading || !onAction}
            aria-busy={isActionLoading}
          >
            {isActionLoading ? (
              <StyledLoadingText>Загрузка…</StyledLoadingText>
            ) : (
              btnContent
            )}
          </StyledBtn>
        ) : null}
        {mainText ? <StyledMainText>{mainText}</StyledMainText> : null}
      </StyledContentWrapper>
    </StyledModalWidnow>
  );
};

export default ModalWindow;
