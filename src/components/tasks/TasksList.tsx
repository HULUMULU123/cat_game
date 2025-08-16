import styled from "styled-components"
import TaskItem from "./TaskItem"
import advert from '../../assets/icons/advert.svg'
const StyledContentWrapper = styled.div`
margin: 0 auto;
width: 95%;

overflow-y: scroll;   /* только вертикальный скролл */
overflow-x: hidden;   /* горизонтального нет */
padding-right: 3px;   /* отступ от контента */
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

const StyledTasksList = styled.ul`
padding: 0;
display: flex;
flex-direction: column;
gap: 5px;
`
export default function TasksList() {
  return (
    <StyledContentWrapper>
        <StyledTasksList>
          
            
          {Array.from({ length: 50 }).map((_, i) => (
            <TaskItem key={i} name='Просмотр рекламного ролика' img={advert} />
          ))}
        </StyledTasksList>
    </StyledContentWrapper>
  )
}
