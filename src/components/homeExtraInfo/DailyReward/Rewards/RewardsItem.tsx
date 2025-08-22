import styled from "styled-components"
import drop from '../../../../assets/icons/drop.svg'
const StyledListItem = styled.li`
display: flex;
flex-direction: column;
align-items: center;
`

const StyledItemContent = styled.div`
width: 80%;
margin: auto;
display: flex;
align-items: center;
gap:5px;
`

const StyledContentImg = styled.img``

const StyledContentSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 20px;
font-weight: 700;
color: var(--color-white-text);
`

const StyledUnderItemSpan = styled.span`
  font-size: 14px;
  font-weight: 300;
  color: rgb(113,143,139);
  font-family: 'Roboto', sans-serif;` 

export default function RewardsItem() {
  return (
    <StyledListItem>
        <StyledItemContent>
            <StyledContentImg src={drop}/>
            <StyledContentSpan>
                10
            </StyledContentSpan>
        </StyledItemContent>
        <StyledUnderItemSpan>
            26 / 07
        </StyledUnderItemSpan>
    </StyledListItem>
  )
}
