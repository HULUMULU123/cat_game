import React from 'react'
import styled from 'styled-components'
import FailrueHeader from '../components/failure/header/FailrueHeader'
import Droplets from '../components/failure/droplets/Droplets'

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100vh;
  width: 100%;
`

const StyledContentWrapper = styled.div`
position: absolute;
display: flex;
flex-direction: column;
align-items: center;
top:0;
left: 0;
width: 100%;
height: 100%;
z-index: 1;
`


export default function Failure() {
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <FailrueHeader/>
      </StyledContentWrapper>
      <Droplets/>
    </StyledWrapper>
  )
}
