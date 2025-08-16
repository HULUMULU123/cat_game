import styled from "styled-components"
import TaskItem from "./TaskItem"
import advert from '../../assets/icons/advert.svg'
const StyledContentWrapper = styled.div`
margin: 0 auto;
width: 95%;

overflow-y: scroll;   /* только вертикальный скролл */
overflow-x: hidden;   /* горизонтального нет */
padding-right: 5px;   /* отступ от контента */
box-sizing: content-box;

scrollbar-width: thin;
  scrollbar-color: #E1FFFB #2CC2A9; /* активная | неактивная *//* чтобы padding не "съел" ширину */
&::-webkit-scrollbar{
   width: 10px; 
}
&::-webkit-scrollbar-track{
  background: #2CC2A9;  /* неактивная часть */
  border-radius: 8px;
}

&::-webkit-scrollbar-thumb{
  background: #E1FFFB;  /* активная часть */
  border-radius: 8px;
}
`

const StyledTasksList = styled.ul`
padding: 0;
`
export default function TasksList() {
  return (
    <StyledContentWrapper>
        <StyledTasksList>
            <TaskItem name='Просмотр рекламного ролика' img={advert} />
            <TaskItem name='Просмотр рекламного ролика' img={advert} />
            <TaskItem name='Просмотр рекламного ролика' img={advert} />
            <TaskItem name='Просмотр рекламного ролика' img={advert} />
        </StyledTasksList>
    </StyledContentWrapper>
  )
}
