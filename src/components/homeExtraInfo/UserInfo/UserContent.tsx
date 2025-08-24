import React from 'react'
import UserBalance from './UserBalance'
import UserStatistics from './UserStatistics'
import styled from 'styled-components'

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items:center;
width: 95%;
margin: 0 auto;
gap: 20px;
`
export default function UserContent() {
  return (
    <StyledWrapper>
        <UserBalance/>
        <UserStatistics/>
    </StyledWrapper>
  )
}
