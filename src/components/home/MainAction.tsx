import { MouseEvent, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import gift from "../../assets/icons/gift.svg";
import { HomeModalType } from "./types";
import { request } from "../../shared/api/httpClient";
import { GiftResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

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
  font-size: 24px;
  font-weight: 700;

  @media (max-width: 370px) {
    font-size: 18px;
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
  const tokens = useGlobalStore((state) => state.tokens);
  const [giftInfo, setGiftInfo] = useState<GiftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!tokens) {
      return;
    }

    let isMounted = true;

    const fetchGift = async () => {
      try {
        const data = await request<GiftResponse>("/gift/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });
        if (isMounted) {
          setGiftInfo(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setGiftInfo(null);
          setError("Подарок недоступен");
        }
      }
    };

    void fetchGift();

    return () => {
      isMounted = false;
    };
  }, [tokens]);

  useEffect(() => {
    if (!giftInfo?.expires_at) {
      return undefined;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [giftInfo?.expires_at]);

  const countdown = useMemo(() => {
    if (!giftInfo?.expires_at) {
      return null;
    }

    const expiresAt = new Date(giftInfo.expires_at).getTime();
    const diff = Math.max(expiresAt - now, 0);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (value: number) => value.toString().padStart(2, "0");

    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }, [giftInfo?.expires_at, now]);

  const handleGiftClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpenModal("prize");
  };

  return (
    <StyledActionBtn type="button" onClick={() => navigate("/failure")}> 
      <StyledActionContentWrapper>
        <StyledActionTextWrapper>
          <StyledActionName>{giftInfo ? giftInfo.title : "СБОЙ НАЧАЛСЯ"}</StyledActionName>
          <StyledActionTimer>{countdown ?? error ?? ""}</StyledActionTimer>
        </StyledActionTextWrapper>
        <StyledGiftWrapper type="button" onClick={handleGiftClick}>
          <StyledGiftImg src={gift} alt="Gift" />
        </StyledGiftWrapper>
      </StyledActionContentWrapper>
    </StyledActionBtn>
  );
};

export default MainAction;
