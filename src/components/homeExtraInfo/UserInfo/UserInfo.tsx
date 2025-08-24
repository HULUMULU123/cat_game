import React from 'react'
import styled from 'styled-components'
import UserHeader from './UserHeader'
import UserInformation from './UserInformation'

const StyledWrapper = styled.div`
width: 100%;`

export default function UserInfo({handleClose}) {
  return (
    <StyledWrapper>
        <UserHeader handleClose={handleClose}/>
        <UserInformation/>
    </StyledWrapper>
  )
}
