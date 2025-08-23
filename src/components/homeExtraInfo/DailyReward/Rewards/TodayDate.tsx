import React from 'react'
import styled from 'styled-components'

const StyledWrapperDate = styled.div`
width: 100%;
align-items: center;
display: flex; 
flex-direction: column;
gap: 7px;
font-family: 'Conthrax', sans-serif;
font-weight: 800;
`

const StyledSmallDate = styled.span`
color: rgb(158, 185, 181);
font-size: 12px;`

const StyledBigDiv = styled.span`
font-size: 28px;
color: var(--color-white-text)`

export default function TodayDate() {
  return (
    <div>TodayDate</div>
  )
}
