import React from 'react'
import styled from 'styled-components'
import CoinCount from '../components/common/CoinCount'
import SectionInfo from '../components/common/SectionInfo'
import TasksList from '../components/tasks/TasksList'

const StyledWrapper = styled.div`
    height:100vh;
    width:100%;
    backdrop-filter: blur(40px);
`
export default function Tasks() {
  return (
    <StyledWrapper>
        <CoinCount/>
        <SectionInfo InfoName={'ИНФО - УЗЛЫ'} InfoExtra={'08 : 16 : 24'}/>
        <TasksList/>
    </StyledWrapper>
  )
}
