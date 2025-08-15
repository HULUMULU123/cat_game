import styled from "styled-components"

const StyledListItem = styled.li`
display:flex;
padding: 15px 7px;
justify-content: space-between;
width:100%;
`

const StyledListImg = styled.img`
width: 30px;
`

const StyledListName = styled.span`
font-family:'Conthrax', sans-serif;
font-size: 11px;

`

const StyledListButton = styled.button`
width: 15%;
padding: 7px 0;
border:none;
background: transparent;    
`


export default function TaskItem({name, img}) {
  return (
    <StyledListItem>
        <StyledListImg src={img} />
        <StyledListName>{name}</StyledListName>
        <StyledListButton>{'->'}</StyledListButton>
    </StyledListItem>
  )
}
