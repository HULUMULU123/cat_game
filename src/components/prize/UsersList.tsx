import React from 'react'
import styled from 'styled-components'
import UsersItem from './UsersItem'

const StyledWrapper = styled.div`
    width: 95%;
    display: flex;
    margin: 0 auto;
    flex-direction: column;

`

const StyledContentWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
`

const StyledHeader = styled.h3`
font-family: 'Conthrax', sans-serif;
font-size: 12px;
color: rgb(224,255,251);
padding: 0;
margin: 0;
font-weight: 500;
width: 60%; 
text-align: center;
`

const StyledList = styled.ul`
margin-top: 10px;
display: flex;
padding: 0;
margin:0;
align-items: center;
gap: 5px;
width: 100%;
flex-direction: column;

overflow-y: scroll;   /* только вертикальный скролл */
overflow-x: hidden;   /* горизонтального нет */
   /* отступ от контента */
box-sizing: content-box;

scrollbar-width: thin;
  scrollbar-color: #E1FFFB #2CC2A9; /* активная | неактивная *//* чтобы padding не "съел" ширину */
height: 65vh;
&::-webkit-scrollbar{
   width: 4px; 
}
&::-webkit-scrollbar-track{
  background: #2CC2A9;  /* неактивная часть */
  border-radius: 10px;
}

&::-webkit-scrollbar-thumb{
  background: #E1FFFB;  /* активная часть */
  border-radius: 20px;
}
`

export default function UsersList() {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledHeader>ТОП ИГРОКОВ ТЕКУЩЕГО СБОЯ</StyledHeader>
            <StyledList>
            {Array.from({ length: 30 }, (_, i) => (
                <UsersItem key={i} number={i + 1} />
            ))}
            </StyledList>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
