import React from 'react'
import styled from 'styled-components'
import PrevContentHeader from './PrevContentHeader'
import UsersList from './UsersList'
import UserResults from './UserResults'

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

export default function PrevContent() {
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <PrevContentHeader />
        <UsersList />
        <UserResults />
      </StyledContentWrapper>
    </StyledWrapper>
  )
}
