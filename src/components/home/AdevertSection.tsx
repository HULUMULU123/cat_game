import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import advertFallback from "../../assets/icons/advert.svg";
import { request } from "../../shared/api/httpClient";
import type { AdvertisementButtonResponse } from "../../shared/api/types";

const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 12px;
  width: 95%;
  margin: 0 auto;
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
  -webkit-backdrop-filter: blur(20px);
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

const normalizeLink = (link: string): string => {
  const trimmed = link.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export default function AdevertSection() {
  const [buttons, setButtons] = useState<AdvertisementButtonResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await request<AdvertisementButtonResponse[]>(
          "/home/advert-buttons/"
        );
        if (!mounted) return;
        setButtons(data);
        setError(null);
      } catch (e) {
        console.error("[AdvertSection] failed to load", e);
        if (!mounted) return;
        setButtons([]);
        setError("Не удалось загрузить рекламные предложения");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (error) return <Placeholder>{error}</Placeholder>;
    if (!buttons.length)
      return <Placeholder>Рекламные предложения скоро появятся</Placeholder>;

    return (
      <StyledWrapper>
        {buttons.map((button) => {
          const img = button.image?.trim() || advertFallback;
          console.log("img_src", img);
          return (
            <StyledButton
              key={button.id}
              href={normalizeLink(button.link)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StyledButtonImg src={img} alt="" />
              <StyledButtonSpan>{button.title}</StyledButtonSpan>
            </StyledButton>
          );
        })}
      </StyledWrapper>
    );
  }, [buttons, error]);

  return content;
}
