import React from 'react'
import styled from 'styled-components'
import UsersItem from './UsersItem'

const StyledList = styled.ul`
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: 5px;
    width: 100%;
    padding: 0;
    margin: 10px 0;
`
export default function UsersList() {
  return (
    <StyledList>
        <UsersItem number={1}/>
        <UsersItem number={2}/>
        <UsersItem number={3}/>
        <UsersItem number={4}/>
        <UsersItem number={5}/>
        <UsersItem number={6}/>
    </StyledList>
  )
}
