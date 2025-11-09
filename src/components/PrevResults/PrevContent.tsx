import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import PrevContentHeader from './PrevContentHeader'
import UsersList from './UsersList'
import UserResults from './UserResults'
import { request } from '../../shared/api/httpClient'
import type {
  FailureResponse,
  LeaderboardEntryResponse,
  LeaderboardResponse,
} from '../../shared/api/types'
import useGlobalStore from '../../shared/store/useGlobalStore'
import { useQuery } from 'react-query'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
 background: #126358;
  background: linear-gradient(216deg, rgba(18, 99, 88, 0.4) 50%, rgba(119, 162, 148, 0.2) 100%);
border-radius: 7px;
width: 95%;
padding: 20px 0;`

const StyledContentWrapper = styled.div`
width: 90%;
margin: auto;
display: flex;
flex-direction: column;
`

const formatDateLabel = (iso: string) => {
  try {
    const date = new Date(iso)
    return date.toLocaleString()
  } catch {
    return iso
  }
}

const formatAchievedTime = (iso?: string | null) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    return `${hh}:${mm}`
  } catch {
    return ''
  }
}

export default function PrevContent() {
  const tokens = useGlobalStore((state) => state.tokens)
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(null)
  const {
    data: failuresData,
    isLoading: isFailuresLoading,
    isError: isFailuresError,
    error: failuresError,
  } = useQuery<FailureResponse[]>({
    queryKey: ['prev-results', 'failures', tokens?.access ?? null],
    enabled: Boolean(tokens),
    queryFn: async () => {
      if (!tokens) throw new Error('missing tokens')
      const data = await request<FailureResponse[]>(`/failures/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      })
      return data
        .filter((failure) => !failure.is_active && failure.end_time)
        .sort((a, b) => {
          if (!a.end_time) return 1
          if (!b.end_time) return -1
          return new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
        })
    },
  })

  useEffect(() => {
    if (isFailuresError && failuresError) {
      console.error('Failed to load failures', failuresError)
    }
  }, [failuresError, isFailuresError])

  const failures = failuresData ?? []

  useEffect(() => {
    if (!failures.length) {
      setSelectedFailureId(null)
      return
    }

    setSelectedFailureId((prev) => {
      if (prev && failures.some((failure) => failure.id === prev)) {
        return prev
      }
      return failures[0]?.id ?? null
    })
  }, [failures])

  const {
    data: leaderboardData,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
    error: leaderboardError,
  } = useQuery<{ entries: LeaderboardEntryResponse[]; currentUser: LeaderboardEntryResponse | null }>(
    {
      queryKey: [
        'prev-results',
        'leaderboard',
        tokens?.access ?? null,
        selectedFailureId ?? null,
      ],
      enabled: Boolean(tokens && selectedFailureId),
      queryFn: async () => {
        if (!tokens || !selectedFailureId) throw new Error('missing context')
        const data = await request<LeaderboardResponse>(
          `/leaderboard/?failure=${selectedFailureId}`,
          {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }
        )

        const mappedEntries = (data.entries || []).map((entry) => ({
          ...entry,
          display_time: formatAchievedTime((entry as any).achieved_at),
        })) as LeaderboardEntryResponse[]

        const mappedCurrent = data.current_user
          ? ({
              ...data.current_user,
              display_time: formatAchievedTime((data.current_user as any).achieved_at),
            } as LeaderboardEntryResponse)
          : null

        return { entries: mappedEntries, currentUser: mappedCurrent }
      },
    }
  )

  useEffect(() => {
    if (isLeaderboardError && leaderboardError) {
      console.error('Failed to load leaderboard', leaderboardError)
    }
  }, [isLeaderboardError, leaderboardError])

  const entries = leaderboardData?.entries ?? []
  const currentUser = leaderboardData?.currentUser ?? null
  const leaderboardErrorMessage = isLeaderboardError
    ? 'Не удалось загрузить результаты сбоя'
    : null

  const options = useMemo(
    () =>
      failures.map((failure) => ({
        label: failure.end_time ? formatDateLabel(failure.end_time) : failure.name,
        value: failure.id.toString(),
      })),
    [failures]
  )

  const handleSelect = (value: string) => {
    const id = Number(value)
    setSelectedFailureId(Number.isNaN(id) ? null : id)
  }

  return (
    <Wrapper>
      <StyledWrapper>
        <StyledContentWrapper>
          <PrevContentHeader
            options={options}
            selectedValue={selectedFailureId ? selectedFailureId.toString() : null}
            onSelect={handleSelect}
            isLoading={isFailuresLoading}
          />
          <UsersList
            entries={entries}
            isLoading={isLeaderboardLoading}
            error={leaderboardErrorMessage}
          />
        </StyledContentWrapper>
      </StyledWrapper>
      <UserResults entry={currentUser} />
    </Wrapper>
  )
}
