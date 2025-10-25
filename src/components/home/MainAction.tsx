import { MouseEvent, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import gift from "../../assets/icons/gift.svg";
import type { HomeModalType } from "./types";
import { request } from "../../shared/api/httpClient";
import type { GiftResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

const StyledActionBtn = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 90px;
  padding: 7px 30px;
  background: #fff;
  box-shadow: 1px 3px 6px 0 rgba(0, 255, 174, 0.3);
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

/** ⚠️ БЫЛО button — делает вложенную кнопку. Делаем div с семантикой кнопки. */
const StyledGiftWrapper = styled.div`
  position: absolute;
  top: -20px;
  right: -20%;
  background: #2cc295;
  border-radius: 7px;
  display: flex;
  padding: 7px 15px;
  cursor: pointer;
`;

const StyledGiftImg = styled.img`
  width: 24px;
  height: 24px;
`;

interface MainActionProps {
  onOpenModal: (modalType: HomeModalType) => void;
}

const MainAction = ({ onOpenModal }: MainActionProps) => {
  const navigate = useNavigate();
  const tokens = useGlobalStore((s) => s.tokens);

  const [giftInfo, setGiftInfo] = useState<GiftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!tokens) return;
    let mounted = true;

    (async () => {
      try {
        const data = await request<GiftResponse>("/gift/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (mounted) {
          setGiftInfo(data);
          setError(null);
        }
      } catch {
        if (mounted) {
          setGiftInfo(null);
          setError("Подарок недоступен");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tokens]);

  useEffect(() => {
    if (!giftInfo?.expires_at) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [giftInfo?.expires_at]);

  const countdown = useMemo(() => {
    if (!giftInfo?.expires_at) return null;
    const expiresAt = new Date(giftInfo.expires_at).getTime();
    const diff = Math.max(expiresAt - now, 0);
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);
    const pad = (v: number) => v.toString().padStart(2, "0");
    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }, [giftInfo?.expires_at, now]);

  const handleGiftClick = (event: MouseEvent) => {
    event.stopPropagation(); // чтобы не сработал навигатор на родителе
    onOpenModal("prize");
  };

  const handleGiftKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenModal("prize");
    }
  };

  return (
    <StyledActionBtn type="button" onClick={() => navigate("/failure")}>
      <StyledActionContentWrapper>
        <StyledActionTextWrapper>
          <StyledActionName>
            {giftInfo?.title ?? "СБОЙ НАЧАЛСЯ"}
          </StyledActionName>
          <StyledActionTimer>{countdown ?? error ?? ""}</StyledActionTimer>
        </StyledActionTextWrapper>

        {/* НЕ кнопка внутри кнопки */}
        <StyledGiftWrapper
          role="button"
          aria-label="Открыть подарок"
          tabIndex={0}
          onClick={handleGiftClick}
          onKeyDown={handleGiftKeyDown}
        >
          <StyledGiftImg src={gift} alt="" />
        </StyledGiftWrapper>
      </StyledActionContentWrapper>
    </StyledActionBtn>
  );
};

export default MainAction;
