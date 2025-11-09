import { useEffect, useMemo } from "react";
import styled from "styled-components";
import UsersItem from "./UsersItem";
import UserResult from "./UserResult";
import { request } from "../../shared/api/httpClient";
import type {
  LeaderboardResponse,
  LeaderboardEntryResponse,
  FailureResponse,
} from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";
import { useQuery } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

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

/** Форматируем ISO-время результата в HH:MM (локальное) */
const formatAchievedTime = (iso?: string | null) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
};

const UsersList = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const {
    data: leaderboard,
    isLoading,
    isError,
    error: leaderboardError,
  } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", tokens?.access ?? null],
    queryFn: async () => {
      if (!tokens) {
        return {
          entries: [],
          failure: null,
          current_user: null,
        } as LeaderboardResponse;
      }
      return request<LeaderboardResponse>("/leaderboard/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
    enabled: Boolean(tokens),
  });

  useEffect(() => {
    if (isError && leaderboardError) {
      console.error("[UsersList] leaderboard fetch error", leaderboardError);
    }
  }, [isError, leaderboardError]);

  const entries = useMemo(() => {
    const rawEntries = leaderboard?.entries ?? [];
    const filtered = rawEntries.filter((entry) => (entry.score ?? 0) > 0);
    return filtered.map((entry) => ({
      ...entry,
      display_time: formatAchievedTime((entry as any).achieved_at),
    })) as LeaderboardEntryResponse[];
  }, [leaderboard?.entries]);

  const currentUser = useMemo(() => {
    if (!leaderboard?.current_user) return null;
    const entry = leaderboard.current_user as LeaderboardEntryResponse & {
      achieved_at?: string | null;
    };
    return {
      ...entry,
      display_time: formatAchievedTime(entry.achieved_at),
    } as LeaderboardEntryResponse;
  }, [leaderboard?.current_user]);

  const failure: FailureResponse | null = leaderboard?.failure ?? null;

  const listContent = useMemo(() => {
    if (!tokens) {
      return (
        <Placeholder>
          Авторизуйтесь, чтобы увидеть таблицу лидеров
        </Placeholder>
      );
    }

    if (isLoading) {
      return (
        <Placeholder>
          <LoadingSpinner label="Загружаем участников" />
        </Placeholder>
      );
    }

    if (isError) {
      return (
        <Placeholder>Не удалось загрузить таблицу лидеров</Placeholder>
      );
    }

    if (!entries.length) {
      return <Placeholder>Данные таблицы призёров появятся позже</Placeholder>;
    }

    return entries.map((entry) => (
      <UsersItem key={`${entry.username}-${entry.position}`} entry={entry} />
    ));
  }, [entries, isError, isLoading, tokens]);

  const failureName = failure?.name ?? "Активный сбой не найден";
  const failureEnd = useMemo(() => {
    if (!failure || !failure.end_time) return "";
    try {
      const endDate = new Date(failure.end_time);
      return endDate.toLocaleString();
    } catch {
      return "";
    }
  }, [failure]);

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <StyledHeader>
          {failure?.name
            ? `ТОП ИГРОКОВ: ${failureName}`
            : "ТОП ИГРОКОВ ТЕКУЩЕГО СБОЯ"}
        </StyledHeader>
        {failureEnd ? (
          <Placeholder>Завершение: {failureEnd}</Placeholder>
        ) : null}
        <StyledList>{listContent}</StyledList>
        <UserResult entry={currentUser} />
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

export default UsersList;
