import React from 'react'
import styled from 'styled-components'
import CoinCount from '../components/tasks/CoinCount'
import TasksInfo from '../components/tasks/TasksInfo'

const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`
export default function Tasks() {
  return (
    <StyledWrapper>
        <CoinCount/>
        <TasksInfo/>
    </StyledWrapper>
  )
}
