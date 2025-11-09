import styled, { css } from 'styled-components'
import white_prize from '../../assets/icons/white_prize.svg'
import empty_prize from '../../assets/icons/empty_prize.svg'
import type { LeaderboardEntryResponse } from '../../shared/api/types'

const StyledItem = styled.li<{ $position: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  width: 95%;
  margin: 0 auto;
  border-radius:7px;
  ${({ $position }) => {
    if ($position === 1) {
      return css`
        background: linear-gradient(90deg, rgba(31, 255, 227, 1) 0%, rgba(0, 223, 152, 1) 100%);
      `
    }
    if ($position === 2 || $position === 3) {
      return css`
        background: linear-gradient(228deg, rgba(31, 255, 227, 0.8) 0%, rgba(0, 223, 152, 0.82) 100%);
      `
    }
    return css`
      background: transparent;
    `
  }};
`;


const NumberWrapper = styled.div`
display: flex;
align-items: center;
gap: 5px;`

const NumberSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 800;
color: #fff;`

const PrizeImg = styled.img`
width: 19px;
height: 19px;`

const NicknameSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
font-weight: 800;
color: #fff;`

const TimeSpan = styled.span`
font-family: 'Roboto', sans-serif;
font-size: 12px;
font-weight: 300;
color: #fff;`

const ScoreSpan = styled.span`font-family: 'Conthrax', sans-serif;
font-size: 10px;
font-weight: 800;
color: #fff;`

const getPrizeImg = (position: number) => {
    if (position === 1) return white_prize;
    if (position === 2 || position === 3) return empty_prize;
    return null; // ничего или прозрачный плейсхолдер
  };

const getText = (position: number) => {
    if (position <= 3) return position;
    return `#${position}`;
  };

const getDisplayName = (entry: LeaderboardEntryResponse) => {
  const parts = [entry.first_name, entry.last_name].filter(Boolean);
  if (parts.length) {
    return parts.join(' ');
  }
  return entry.username;
};

interface UsersItemProps {
  entry: LeaderboardEntryResponse;
  index: number;
}

export default function UsersItem({ entry, index }: UsersItemProps) {
  const position = entry.position ?? index + 1;
  const prizeImg = getPrizeImg(position);
  const timeLabel = entry.display_time || '';
  const scoreLabel = entry.score?.toLocaleString?.('ru-RU') ?? entry.score;

  return (
    <StyledItem $position={position}>
      <NumberWrapper>
        {prizeImg && <PrizeImg src={prizeImg} alt="Призовое место" />}
        <NumberSpan>{getText(position)}</NumberSpan>
      </NumberWrapper>
      <NicknameSpan>{getDisplayName(entry)}</NicknameSpan>
      <TimeSpan>{timeLabel}</TimeSpan>
      <ScoreSpan>{scoreLabel}</ScoreSpan>
    </StyledItem>
  )
}
