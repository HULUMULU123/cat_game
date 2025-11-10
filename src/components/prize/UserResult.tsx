import styled from "styled-components";
import avatar from "../../assets/avatar.jpg";
import type { LeaderboardEntryResponse } from "../../shared/api/types";

const StyledUserItem = styled.li`
  background: #26b291;
  width: 100%;
  display: flex;
  padding: 7px 0;
  border-radius: 7px;
  margin: 10px auto;
  color: rgb(224, 255, 251);
`;

const StyledContentWrapper = styled.div`
  width: 95%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "Conthrax", sans-serif;
`;

const StyledNumberSpan = styled.span`
  display: flex;
  justify-content: right;
  align-items: center;
  min-width: 30px;
  color: rgb(224, 255, 251);
  font-size: 12px;
  font-weight: 700;
`;

const StyledUserProfile = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
`;

const StyledUserImg = styled.img`
  width: 25px;
  height: 25px;
  border-radius: 50%;
`;

const StyledUserSpan = styled.span`
  color: rgb(224, 255, 251);
  font-size: 11px;
`;

const StyledUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const StyledUserTime = styled.span`
  color: rgb(224, 255, 251);
  font-family: "Roboto", sans-serif;
  font-weight: 100;
  font-size: 11px;
`;

const StyledUserScore = styled.span`
  color: rgb(224, 255, 251);
  font-weight: 700;
  font-size: 11px;
`;

interface UserResultProps {
  entry: LeaderboardEntryResponse | null;
}

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hrs} : ${mins} : ${secs}`;
};

const UserResult = ({ entry }: UserResultProps) => {
  if (!entry) {
    return null;
  }

  const displayName = entry.first_name || entry.username;
  const avatarSrc =
    entry.photo_url && entry.photo_url.trim().length > 0 ? entry.photo_url : avatar;

  return (
    <StyledUserItem>
      <StyledContentWrapper>
        <StyledNumberSpan>#{entry.position}</StyledNumberSpan>
        <StyledUserProfile>
          <StyledUserImg src={avatarSrc} alt={displayName} />
          <StyledUserSpan>{displayName}</StyledUserSpan>
        </StyledUserProfile>
        <StyledUserInfo>
          <StyledUserTime>{formatDuration(entry.duration_seconds)}</StyledUserTime>
          <StyledUserScore>{entry.score.toLocaleString("ru-RU")}</StyledUserScore>
        </StyledUserInfo>
      </StyledContentWrapper>
    </StyledUserItem>
  );
};

export default UserResult;
