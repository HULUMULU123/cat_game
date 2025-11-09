import styled from 'styled-components'
import avatar from '../../assets/avatar.jpg'
import type { LeaderboardEntryResponse } from '../../shared/api/types'

const StyledUserItem = styled.li`
background: #26B291;
width: 95%;
display: flex;
padding: 7px 0;
border-radius: 7px;
margin: 10px auto;
color: rgb(224,255,251);
`

const StyledContentWrapper = styled.div`
width: 95%;
margin: auto;
display:flex;
align-items: center;
justify-content: space-between;
font-family: 'Conthrax', sans-serif;
`

const StyledNumberSpan = styled.span`
display: flex;
justify-content: right;
align-items: center;
min-width: 30px;
color: rgb(224,255,251);
font-size: 12px;
font-weight: 700;`

const StyledUserProfile = styled.div`
display: flex;
gap: 18px;
align-items: center;
`

const StyledUserImg = styled.img`
width: 25px;
height: 25px;
border-radius: 50%;
`

const StyledUserSpan = styled.span`
color: rgb(224,255,251);
font-size: 11px;`

const StyledUserInfo = styled.div`
display: flex;
align-items: center;
gap: 14px;
`

const StyledUserTime = styled.span`
color: rgb(224,255,251);
font-family: 'Roboto', sans-serif;
font-weight: 100;
font-size: 11px;`

const StyledUserScore = styled.span`
color: rgb(224,255,251);
font-weight: 700;
font-size: 11px;
`

interface UserResultsProps {
  entry: LeaderboardEntryResponse | null;
}

const buildDisplayName = (entry: LeaderboardEntryResponse) => {
  const parts = [entry.first_name, entry.last_name].filter(Boolean)
  if (parts.length) return parts.join(' ')
  return entry.username
}

export default function UserResults({ entry }: UserResultsProps) {
  if (!entry) return null

  return (
    <StyledUserItem>
        <StyledContentWrapper>
            <StyledNumberSpan>#{entry.position}</StyledNumberSpan>
            <StyledUserProfile>
                <StyledUserImg src={avatar} alt="Профиль"/>
                <StyledUserSpan>{buildDisplayName(entry)}</StyledUserSpan>
            </StyledUserProfile>
            <StyledUserInfo>
                <StyledUserTime>
                    {entry.display_time || ''}
                </StyledUserTime>
                <StyledUserScore>
                    {entry.score?.toLocaleString?.('ru-RU') ?? entry.score}
                </StyledUserScore>
            </StyledUserInfo>
        </StyledContentWrapper>
    </StyledUserItem>
  )
}
