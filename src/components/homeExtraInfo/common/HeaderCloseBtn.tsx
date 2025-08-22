import React from 'react'
import styled from 'styled-components'
import cross from '../../../assets/icons/cancel.svg'
const StyledBtnWrapper = styled.div`
display: flex;
height:100%;
`

const StyledBtn = styled.button`
margin: auto;
border: none;
background: transparent;
height: 25px;
width: 25px;
`

const StyledBtnImg = styled.img`
width: 100%;
height: 100%;`


export default function HeaderCloseBtn({handleClose}) {
  return (
    <StyledBtnWrapper>
        <StyledBtn onClick={handleClose}>
            <StyledBtnImg src={cross}/>
        </StyledBtn>
    </StyledBtnWrapper>
  )
}
