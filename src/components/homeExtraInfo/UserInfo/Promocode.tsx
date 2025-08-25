import React from 'react'
import styled from 'styled-components'
import arrow from '../../../assets/icons/arrow.svg'
const StyledWrapper = styled.div`
width: 100%;
display: flex;
align-items: center;
margin: 40px auto;`

const StyledContentWrapper = styled.div`
width: 50%;
display: flex;
flex-direction: column;
align-items:center;
margin: 0 auto;`

// const StyledDateSpan = styled.span`
// font-family: 'Conthrax', sans-serif;
// font-size: 14px;
// font-weight: 800;
// color: var(--color-white-text);
// `

const StyledInviteBtn = styled.button`
    background: #126358;
    background: linear-gradient(216deg, rgba(18, 99, 88, 0.7) 0%, rgba(119, 162, 148, 0.5) 50%);
    padding: 7px 15px;
    margin: 15px auto;
    display: flex;
    gap: 20px;
    align-items: center;
    color: #fff;
    font-family: 'Conthrax', sans-serif;
    font-weight: 800;
`

const StyledInviteImg = styled.img`
    width: 25px;
    height: 25px;
`

const StyledEnterPropmoWrapper = styled.div`
    width: 90%;
    padding: 10px 15px;
    background: #26B291;
    border-radius: 7px;
    display:flex;
    justify-content: center;
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
            <StyledInviteBtn>
                <StyledInviteImg src={arrow}/>
            </StyledInviteBtn>
            <StyledEnterPropmoWrapper>
                <StyledEnterPromoBtn onClick={()=>handleOpenModal(true)}>
                    ВВЕСТИ ПРОМОКОД |
                </StyledEnterPromoBtn>
            </StyledEnterPropmoWrapper>
        </StyledContentWrapper>
    </StyledWrapper>
  )
}
