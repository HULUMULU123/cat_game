import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import UsersItem from "./UsersItem";
import UserResult from "./UserResult";
import { request } from "../../shared/api/httpClient";
import { LeaderboardResponse, LeaderboardEntryResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

const StyledWrapper = styled.div`
  width: 95%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
`;

const StyledContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  position: relative;
`;

const StyledHeader = styled.h3`
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: rgb(224, 255, 251);
  padding: 0;
  margin: 0;
  font-weight: 500;
  width: 60%;
  text-align: center;
`;

const StyledList = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
  margin-top: 10px;
  align-items: center;
  gap: 5px;
  width: 95%;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: content-box;
  scrollbar-width: thin;
  scrollbar-color: #e1fffb #2cc2a9;
  height: 50vh;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #2cc2a9;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e1fffb;
    border-radius: 20px;
  }
`;

const Placeholder = styled.div`
  margin: 24px auto;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: rgb(199, 247, 238);
`;

const UsersList = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) {
      return;
    }

    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        const data = await request<LeaderboardResponse>("/leaderboard/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });
        if (isMounted) {
          setEntries(data.entries);
          setCurrentUser(data.current_user);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить таблицу лидеров");
        }
      }
    };

    void fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [tokens]);

  const listContent = useMemo(() => {
    if (error) {
      return <Placeholder>{error}</Placeholder>;
    }

    if (!entries.length) {
      return <Placeholder>Данные таблицы призёров появятся позже</Placeholder>;
    }

    return entries.map((entry) => <UsersItem key={entry.position} entry={entry} />);
  }, [entries, error]);

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <StyledHeader>ТОП ИГРОКОВ ТЕКУЩЕГО СБОЯ</StyledHeader>
        <StyledList>{listContent}</StyledList>
        <UserResult entry={currentUser} />
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

export default UsersList;
