import styled from "styled-components"
import arrow from "../../assets/icons/arrow.svg"
import check from '../../assets/icons/check.svg'
const StyledListItem = styled.li`

display:flex;
padding: 15px 7px;
justify-content: space-between;
width:90%;
margin: 0 auto;
border-radius: 7px;
background: rgba(255,255,255,0.3);
align-items: center;
position:relative;
`

const StyledWrapper = styled.div`
filter:  ${({ $done }) => ($done ? "blur(3px)" : "")};
opacity:  ${({ $done }) => ($done ? "0.5" : "1")};
width: 100%;
height:100%;
display:flex;
justify-content: space-between;
margin: 0 auto;
align-items: center;`

const StyledListItemContent = styled.div`
display:flex;

margin: auto;
align-items: center;
width: 90%;

`

const StyledListImg = styled.img`
width: 30px;
margin-right: 15px;
`

const StyledListName = styled.span`
font-family:'Conthrax', sans-serif;
font-size: 11px;
color: #E1FFFB;
font-weight: 700;
width:60%;
`

const StyledListButton = styled.button`
width: 20%;
padding: 10px 0;
border:none;
background: #44EDD1; 
margin-left: auto;
display: flex;  
border-radius:7px;
 
`

const StyledButtonImg = styled.img`
width:18px;
margin: auto;

`

const StyledCheck = styled.img`
  width:25px;
  position:absolute;
  z-index: 5;
  top:50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display:  ${({ $done }) => ($done ? "block" : "none")};
`
export default function TaskItem({name, img, done=false}) {
  return (
    <StyledListItem >
      <StyledWrapper $done={done}>
        <StyledListItemContent>
          <StyledListImg src={img} />
          <StyledListName>{name}</StyledListName>
          <StyledListButton><StyledButtonImg src={arrow}/></StyledListButton>
        </StyledListItemContent>
      </StyledWrapper>
      <StyledCheck $done={done} src={check}/>
    </StyledListItem>
  )
}
