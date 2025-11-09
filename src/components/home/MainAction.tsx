import { MouseEvent, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import gift from "../../assets/icons/gift.svg";
import type { HomeModalType } from "./types";
import { request } from "../../shared/api/httpClient";
import type { GiftResponse, FailureResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

const StyledActionBtn = styled.button<{ $disabled?: boolean }>`
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
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};

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

/**  БЫЛО button — делает вложенную кнопку. Делаем div с семантикой кнопки. */
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
  const [giftError, setGiftError] = useState<string | null>(null);

  const [failure, setFailure] = useState<FailureResponse | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  // ---- fetch gift ----
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
          setGiftError(null);
        }
      } catch {
        if (mounted) {
          setGiftInfo(null);
          setGiftError("Время неизвестно...");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tokens]);

  // ---- fetch current failure (берём последний созданный) ----
  useEffect(() => {
    if (!tokens) return;
    let mounted = true;

    (async () => {
      try {
        const data = await request<FailureResponse[]>("/failures/", {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (mounted) {
          // предполагаем, что первый элемент — самый актуальный (вьюха отдает -created_at)
          setFailure(data[0] ?? null);
        }
      } catch (e) {
        if (mounted) setFailure(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tokens]);

  // тикер раз в секунду (если есть смысл считать)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startMs = useMemo(
    () => (failure?.start_time ? new Date(failure.start_time).getTime() : null),
    [failure?.start_time]
  );
  const endMs = useMemo(
    () => (failure?.end_time ? new Date(failure.end_time).getTime() : null),
    [failure?.end_time]
  );

  const isActive = useMemo(() => {
    if (!failure) return false;
    // активен, если старт известен и уже наступил
    if (startMs !== null && now >= startMs) {
      // и не закончился, если известен конец
      if (endMs !== null) return now < endMs;
      return true; // без конца — идёт
    }
    return false;
  }, [failure, startMs, endMs, now]);

  const isUpcoming = useMemo(() => {
    if (!failure) return true; // нет сбоя — считаем как "скоро"
    if (startMs === null) return true; // "скоро будет", время не указано
    return now < startMs;
  }, [failure, startMs, now]);

  const headerText = useMemo(() => {
    if (isActive) return "СБОЙ ЗАКОНЧИТСЯ ЧЕРЕЗ";
    if (isUpcoming) return "СБОЙ СКОРО";
    return "ПОИСК АНОМАЛИЙ";
  }, [isActive, isUpcoming]);

  const timerText = useMemo(() => {
    const pad = (v: number) => v.toString().padStart(2, "0");

    // до старта
    if (isUpcoming && startMs !== null) {
      const diff = Math.max(startMs - now, 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    }

    // время старта неизвестно
    if (isUpcoming && startMs === null) {
      return "Поиск аномалий...";
    }

    // идёт: до конца, если он известен
    if (isActive && endMs !== null) {
      const diff = Math.max(endMs - now, 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    }

    // идёт без времени окончания
    if (isActive && endMs === null) {
      return "Идет";
    }

    return ""; // дефолт
  }, [isUpcoming, isActive, startMs, endMs, now]);

  const buttonDisabled = !isActive;

  const handleActionClick = () => {
    if (buttonDisabled) return;
    navigate("/failure");
  };

  const handleGiftClick = (event: MouseEvent) => {
    event.stopPropagation(); // чтобы не сработал клик по основной кнопке
    onOpenModal("prize");
  };

  const handleGiftKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenModal("prize");
    }
  };

  return (
    <StyledActionBtn
      type="button"
      onClick={handleActionClick}
      $disabled={buttonDisabled}
      aria-disabled={buttonDisabled}
    >
      <StyledActionContentWrapper>
        <StyledActionTextWrapper>
          <StyledActionName>{headerText}</StyledActionName>
          <StyledActionTimer>{timerText || giftError || ""}</StyledActionTimer>
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
