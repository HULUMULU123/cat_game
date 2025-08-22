import React from 'react'
import styled from 'styled-components'
import Header from '../common/Header'
const StyledWrapper = styled.div`
  width:100%;
  overflow-y: scroll;   /* только вертикальный скролл */
  overflow-x: hidden;   /* горизонтального нет */
    /* отступ от контента */
  box-sizing: content-box;

  scrollbar-width: thin;
    scrollbar-color: #E1FFFB #2CC2A9; /* активная | неактивная *//* чтобы padding не "съел" ширину */
  height: 100vh;
  &::-webkit-scrollbar{
    width: 4px; 
  }
  &::-webkit-scrollbar-track{
    background: #2CC2A9;  /* неактивная часть */
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb{
    background: #E1FFFB;  /* активная часть */
    border-radius: 20px;
  }
`
export default function RewardModal({handleClose}) {
  return (
    <StyledWrapper>
        <Header infoType='prize' handleClose={handleClose}/>
    </StyledWrapper>
  )
}
