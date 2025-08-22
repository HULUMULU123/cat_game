import styled from "styled-components"
import drop from '../../../../assets/icons/drop.svg'
const StyledListItem = styled.li`
display: flex;
flex-direction: column;
align-items: center;
display: flex;
flex-direction: column;

`

const StyledItemContent = styled.div`
width: 100%;
margin: auto;
display: flex;
flex-direction: column;
align-items: center;
gap:7px;
background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
border-radius: 7px;
padding: 15px 0;
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
