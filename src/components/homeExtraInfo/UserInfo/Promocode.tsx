import React from 'react'
import styled from 'styled-components'

const StyledWrapper = styled.div`
width: 100%;
display: flex;
align-items: center;
margin: 40px auto;`

const StyledContentWrapper = styled.div`
width: 50%;
display: flex;
flex-direction: column;
align-items:center;`

const StyledDateSpan = styled.span`
font-family: 'Conthrax', sans-serif;
font-size: 14px;
font-weight: 800;
color: var(--color-white-text)
`

const StyledEnterPropmoWrapper = styled.div`
    width: 80%;
    padding: 10px 15px;
    background: #26B291;
    border-radius: 7px;
`

const StyledEnterPromoBtn = styled.button`
background: transparent;
border:none;
border-bottom: 1px dotted var(--color-white-text);
padding: 5px 7px;
color: rgb(85,197,185);
font-family: 'Roboto',sans-serif;
font-weight: 400;`


export default function Promocode({handleOpenModal}) {
  return (
    <StyledWrapper>
        <StyledContentWrapper>
            <StyledDateSpan>25 / 07/ 2025</StyledDateSpan>
            <StyledEnterPropmoWrapper>
                <StyledEnterPromoBtn onClick={()=>handleOpenModal(true)}>
                    ВВЕСТИ ПРОМОКОД |
                </StyledEnterPromoBtn>
            </StyledEnterPropmoWrapper>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
