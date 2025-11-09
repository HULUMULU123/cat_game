import { useMemo } from 'react'
import styled from 'styled-components'
import UsersItem from './UsersItem'
import type { LeaderboardEntryResponse } from '../../shared/api/types'

const StyledList = styled.ul`
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: 5px;
    width: 100%;
    padding: 0;
    margin: 10px 0;
    height: 55vh;
    padding-right: 8px;
    overflow-y: scroll;
    overflow-x: hidden;
    box-sizing: content-box;

    scrollbar-width: thin;
    scrollbar-color: #E1FFFB #2CC2A9;
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: #2CC2A9;
      border-radius: 10px;

    }
    &::-webkit-scrollbar-thumb {
      background: #E1FFFB;
      border-radius: 20px;
    }
`

const Placeholder = styled.div`
  margin: 24px auto;
  text-align: center;
  font-family: 'Conthrax', sans-serif;
  font-size: 12px;
  color: rgb(199, 247, 238);
`

interface UsersListProps {
  entries: LeaderboardEntryResponse[];
  isLoading: boolean;
  error: string | null;
}

export default function UsersList({ entries, isLoading, error }: UsersListProps) {
  const content = useMemo(() => {
    if (isLoading) {
      return <Placeholder>Загрузка...</Placeholder>
    }

    if (error) {
      return <Placeholder>{error}</Placeholder>
    }

    if (!entries.length) {
      return <Placeholder>Результаты будут доступны позже</Placeholder>
    }

    return entries.map((entry, index) => (
      <UsersItem key={`${entry.username}-${entry.position}`} entry={entry} index={index} />
    ))
  }, [entries, error, isLoading])

  return <StyledList>{content}</StyledList>
}
