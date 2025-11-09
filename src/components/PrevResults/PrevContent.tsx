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
  const [failures, setFailures] = useState<FailureResponse[]>([])
  const [selectedFailureId, setSelectedFailureId] = useState<number | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntryResponse[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardEntryResponse | null>(null)
  const [loadingFailures, setLoadingFailures] = useState(false)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokens) return

    let isMounted = true
    setLoadingFailures(true)

    ;(async () => {
      try {
        const data = await request<FailureResponse[]>(`/failures/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        })
        if (!isMounted) return

        const completed = data
          .filter((failure) => !failure.is_active && failure.end_time)
          .sort((a, b) => {
            if (!a.end_time) return 1
            if (!b.end_time) return -1
            return new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
          })

        setFailures(completed)
        setSelectedFailureId((prev) => {
          if (prev && completed.some((f) => f.id === prev)) {
            return prev
          }
          return completed.length ? completed[0].id : null
        })
      } catch (err) {
        if (!isMounted) return
        setFailures([])
        setSelectedFailureId(null)
      } finally {
        if (isMounted) {
          setLoadingFailures(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [tokens])

  useEffect(() => {
    if (!tokens || !selectedFailureId) {
      setEntries([])
      setCurrentUser(null)
      return
    }

    let isMounted = true
    setLoadingLeaderboard(true)

    ;(async () => {
      try {
        const data = await request<LeaderboardResponse>(
          `/leaderboard/?failure=${selectedFailureId}`,
          {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }
        )
        if (!isMounted) return

        const mapped = (data.entries || []).map((entry) => ({
          ...entry,
          display_time: formatAchievedTime((entry as any).achieved_at),
        })) as LeaderboardEntryResponse[]

        setEntries(mapped)
        setCurrentUser(
          data.current_user
            ? ({
                ...data.current_user,
                display_time: formatAchievedTime((data.current_user as any).achieved_at),
              } as LeaderboardEntryResponse)
            : null
        )
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setEntries([])
        setCurrentUser(null)
        setError('Не удалось загрузить результаты сбоя')
      } finally {
        if (isMounted) {
          setLoadingLeaderboard(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [selectedFailureId, tokens])

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
            isLoading={loadingFailures}
          />
          <UsersList
            entries={entries}
            isLoading={loadingLeaderboard}
            error={error}
          />
        </StyledContentWrapper>
      </StyledWrapper>
      <UserResults entry={currentUser} />
    </Wrapper>
  )
}
