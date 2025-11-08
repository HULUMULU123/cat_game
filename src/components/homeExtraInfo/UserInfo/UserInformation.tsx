import React, { useMemo } from 'react'
import styled from 'styled-components'

import avatar from '../../../assets/avatar.jpg'
import useGlobalStore from '../../../shared/store/useGlobalStore'
const StyledWrapper = styled.div`
display: flex;
width: 95%;
justify-content:space-between;
align-items: center;
margin: 0 auto;
`

const StyledImgWrapper = styled.div`
width: 5rem;
height:5rem;
overflow: hidden;
border-radius:50%;
border: 2px solid #85FFF0;
box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
-webkit-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);
-moz-box-shadow: -1px -1px 18px 0px rgba(133,255,240,0.75);`

const StyledImg = styled.img`
width: 100%;
height:100%;
`

const StyledUsernameWrapper = styled.div`
width: 70%;
background: rgba(255,255,255,0.2);
display: flex;
flex-direction: column;
justify-content: center;
border-radius: 7px;
padding: 8px 20px;
gap: 2px;`

const StyledUsernameSpan = styled.span<{ $secondary?: boolean }>`
color:#fff;
font-family: 'Conthrax', sans-serif;
font-weight: ${({ $secondary }) => ($secondary ? 400 : 700)};
font-size: ${({ $secondary }) => ($secondary ? '12px' : '16px')};
opacity: ${({ $secondary }) => ($secondary ? 0.8 : 1)};
`
export default function UserInformation() {
  const userData = useGlobalStore((state) => state.userData)

  const displayName = useMemo(() => {
    if (!userData) return '—'
    const parts = [userData.first_name, userData.last_name]
      .map((value) => (value || '').trim())
      .filter(Boolean)
    if (parts.length) return parts.join(' ')
    if (userData.username) return `@${userData.username}`
    return '—'
  }, [userData])

  return (
    <StyledWrapper>
        <StyledImgWrapper>
            <StyledImg src={userData?.photo_url || avatar} alt="User avatar"/>
        </StyledImgWrapper>
        <StyledUsernameWrapper>
            <StyledUsernameSpan>{displayName}</StyledUsernameSpan>
            {userData?.username ? (
              <StyledUsernameSpan $secondary>
                @{userData.username}
              </StyledUsernameSpan>
            ) : null}
        </StyledUsernameWrapper>
    </StyledWrapper>
  )
}
