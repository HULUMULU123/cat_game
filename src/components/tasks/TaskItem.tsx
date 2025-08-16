import styled from "styled-components"

const StyledListItem = styled.li`
display:flex;
padding: 15px 7px;
justify-content: space-between;
width:90%;
margin: 0 auto;
border-radius: 7px;
background: rgba(255,255,255,0.3);
align-items: center;
`

const StyledListItemContent = styled.div`
display:flex;
justify-content:space-between;
margin: auto;
align-items: center;
width: 90%;

`

const StyledListImg = styled.img`
width: 30px;
`

const StyledListName = styled.span`
font-family:'Conthrax', sans-serif;
font-size: 11px;
color: #E1FFFB;
font-weight: 700;
`

const StyledListButton = styled.button`
width: 15%;
padding: 7px 0;
border:none;
background: #E1FFFB;    
`


export default function TaskItem({name, img}) {
  return (
    <StyledListItem>
      <StyledListItemContent>
        <StyledListImg src={img} />
        <StyledListName>{name}</StyledListName>
        <StyledListButton>{'->'}</StyledListButton>
      </StyledListItemContent>
    </StyledListItem>
  )
}
