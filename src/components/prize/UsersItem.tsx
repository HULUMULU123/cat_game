import styled from "styled-components";
import avatar from "../../assets/avatar.jpg";
import type { LeaderboardEntryResponse } from "../../shared/api/types";

const StyledUserItem = styled.li`
  background: #126358;
  background: linear-gradient(
    216deg,
    rgba(18, 99, 88, 0.4) 50%,
    rgba(119, 162, 148, 0.2) 100%
  );
  width: 100%;
  display: flex;
  padding: 7px 0;
  border-radius: 7px;
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
  color: rgb(141, 169, 163);
  font-size: 11px;
`;

const StyledUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const StyledUserTime = styled.span`
  color: rgb(141, 169, 163);
  font-family: "Roboto", sans-serif;
  font-weight: 100;
  font-size: 11px;
`;

const StyledUserScore = styled.span`
  color: rgb(141, 169, 163);
  font-weight: 700;
  font-size: 11px;
`;

interface UsersItemProps {
  entry: LeaderboardEntryResponse;
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

const UsersItem = ({ entry }: UsersItemProps) => {
  const displayName = entry.first_name || entry.username;

  return (
    <StyledUserItem>
      <StyledContentWrapper>
        <StyledNumberSpan>#{entry.position}</StyledNumberSpan>
        <StyledUserProfile>
          <StyledUserImg src={avatar} alt={displayName} />
          <StyledUserSpan>{displayName}</StyledUserSpan>
        </StyledUserProfile>
        <StyledUserInfo>
          <StyledUserTime>{formatDuration(entry.achieved_at)}</StyledUserTime>
          <StyledUserScore>
            {entry.score.toLocaleString("ru-RU")}
          </StyledUserScore>
        </StyledUserInfo>
      </StyledContentWrapper>
    </StyledUserItem>
  );
};

export default UsersItem;
