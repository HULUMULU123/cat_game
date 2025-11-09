import { useMemo } from "react";
import styled from "styled-components";

import advertFallback from "../../assets/icons/advert.svg";
import { request } from "../../shared/api/httpClient";
import type { AdvertisementButtonResponse } from "../../shared/api/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

/* ======== СТИЛИ ======== */

const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 70px; /* левая и правая колонки фиксированные */
  align-items: start;
  width: 95%;
  margin: 0 auto;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  text-decoration: none;
  border-radius: 7px;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  backdrop-filter: blur(20px);
  transition: transform 0.12s ease-in-out, opacity 0.12s ease-in-out;

  &:active {
    transform: translateY(1px);
  }

  &:hover,
  &:focus-visible {
    opacity: 0.9;
  }
`;

const StyledButtonImg = styled.img`
  width: 60%;
  max-width: 56px;
`;

const StyledButtonSpan = styled.span`
  color: #fff;
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  font-weight: 200;
  text-align: center;
  padding: 0 6px;
`;

const Placeholder = styled.div`
  width: 95%;
  margin: 0 auto;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: #c7f7ee;
  text-align: center;
`;

/* ======== ЛОГИКА ======== */

const normalizeLink = (link: string): string => {
  const trimmed = link.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const toImgSrc = (raw?: string) => {
  if (!raw) return advertFallback;
  const s = raw.trim();
  if (!s) return advertFallback;
  if (s.startsWith("http")) return s;
  if (s.startsWith("/")) return s;
  return `/media/${s.replace(/^media\/?/, "")}`;
};

export default function AdvertSection() {
  const {
    data: buttons = [],
    isLoading,
    isError,
  } = useQuery<AdvertisementButtonResponse[]>({
    queryKey: ["home", "advert-buttons"],
    queryFn: () => request<AdvertisementButtonResponse[]>("/home/advert-buttons/"),
  });

  const content = useMemo(() => {
    if (isLoading)
      return (
        <Placeholder>
          <LoadingSpinner label="Загружаем предложения" />
        </Placeholder>
      );
    if (isError)
      return (
        <Placeholder>Не удалось загрузить рекламные предложения</Placeholder>
      );
    if (!buttons.length)
      return <Placeholder>Рекламные предложения скоро появятся</Placeholder>;

    // Делим кнопки на левую и правую колонку
    const half = Math.ceil(buttons.length / 2);
    const leftButtons = buttons.slice(0, half);
    const rightButtons = buttons.slice(half);

    return (
      <StyledWrapper>
        <Column>
          {leftButtons.map((button) => {
            const img = toImgSrc(button.image);
            return (
              <StyledButton
                key={button.id}
                href={normalizeLink(button.link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledButtonImg src={img} alt={button.title} />
                <StyledButtonSpan>{button.title}</StyledButtonSpan>
              </StyledButton>
            );
          })}
        </Column>
        <div /> {/* пустой центр */}
        <Column>
          {rightButtons.map((button) => {
            const img = toImgSrc(button.image);
            return (
              <StyledButton
                key={button.id}
                href={normalizeLink(button.link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <StyledButtonImg src={img} alt={button.title} />
                <StyledButtonSpan>{button.title}</StyledButtonSpan>
              </StyledButton>
            );
          })}
        </Column>
      </StyledWrapper>
    );
  }, [buttons, isError, isLoading]);

  return content;
}
