import React from 'react'
import styled from 'styled-components'
import UserHeader from './UserHeader'

const StyledWrapper = styled.div`
width: 100%;`

export default function UserInfo({handleClose}) {
  return (
    <StyledWrapper>
        <UserHeader />
    </StyledWrapper>
  )
}
