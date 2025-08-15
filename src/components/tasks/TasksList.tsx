import styled from "styled-components"
import TaskItem from "./TaskItem"
import advert from '../../assets/icons/advert.svg'
const StyledContentWrapper = styled.div`
margin: 0 auto;
width: 95%;`

const StyledTasksList = styled.ul`

`

export default function TasksList() {
  return (
    <StyledContentWrapper>
        <StyledTasksList>
            <TaskItem name='test' img={advert} />
        </StyledTasksList>
    </StyledContentWrapper>
  )
}
