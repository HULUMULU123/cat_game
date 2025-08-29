import React from 'react'
import styled from 'styled-components'
import UsersItem from './UsersItem'

const StyledList = styled.ul`
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: 5px;
    width: 100%;
`
export default function UsersList() {
  return (
    <StyledList>
        <UsersItem/>
        <UsersItem/>
    </StyledList>
  )
}
