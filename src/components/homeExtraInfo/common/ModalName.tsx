import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
width: 100%;
display: flex;
align-items: center; 
justify-content: center;
background: rgba(217, 217, 217, 0.25);
`

const StyledName = styled.span`
font-size: 17px;
font-family: 'Conthrax', sans-serif;
font-weight: 800;
`

export default function ModalName({textName}) {
  return (
    <StyledWrapper>
        <StyledName>{textName}</StyledName>
    </StyledWrapper>
  )
}
