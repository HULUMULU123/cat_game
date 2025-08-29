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
    height: 65vh;
    overflow-y: scroll;
    overflow-x: hidden;
    box-sizing: content-box;

    scrollbar-width: thin;
    scrollbar-color: #E1FFFB #2CC2A9; 
    &::-webkit-scrollbar {
      width: 4px; 
    }
    &::-webkit-scrollbar-track {
      background: #2CC2A9;  
      border-radius: 10px;
      
    }
    &::-webkit-scrollbar-thumb {
      background: #E1FFFB;  
      border-radius: 20px;
    }
`
export default function UsersList() {
  return (
    <StyledList>
      {Array.from({ length: 50 }, (_, i) => (
        <UsersItem key={i + 1} number={i + 1} />
      ))}
    </StyledList>
  )
}
