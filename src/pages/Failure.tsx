import React from 'react'
import styled from 'styled-components'
import FailrueHeader from '../components/failure/header/FailrueHeader'
import Droplets from '../components/failure/droplets/Droplets'
import FailureFooter from '../components/failure/footer/FailureFooter'

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100vh;
  width: 100%;
`

const StyledHeaderWrapper = styled.div`
position: absolute;
display: flex;
flex-direction: column;
align-items: center;
top:0;
left: 0;
width: 100%;
z-index: 1;
`
const StyledFooterWrapper = styled.div`
position: absolute;
display: flex;
flex-direction: column;
align-items: center;
bottom:0;
left: 0;
width: 100%;
z-index: 1;
`


export default function Failure() {
  return (
    <StyledWrapper>
      <StyledHeaderWrapper>
        <FailrueHeader/>
      </StyledHeaderWrapper>
      <Droplets/>
      <StyledFooterWrapper>
        <FailureFooter />
      </StyledFooterWrapper>
    </StyledWrapper>
  )
}
