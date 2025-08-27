import React from 'react'
import styled from 'styled-components'
import { CustomSelect } from './CustomSelect'

const StyledWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    align-items: center;
`

const StyledHeader = styled.h3`
font-family: 'Conthrax', sans-serif;
font-size: 22px;
color: var(--color-white-text);
font-weight: 700;
margin: 0;
padding: 0;
text-align: center;`

const StyledLine = styled.span`
display: block;
width: 100%;
height: 2px;
background: #85FFF0;

`

export default function PrevContentHeader() {
    const options = [
    { label: "23 / 05 / 2025", value: "1" },
    { label: "23 / 05 /2024", value: "2" },
    { label: "23 / 05 / 2023", value: "3" },
    { label: "23 / 04 / 2023", value: "4" },
    { label: "23 / 03 / 2023", value: "5" },
    { label: "23 / 02 / 2023", value: "6" },
    { label: "23 / 01 / 2023", value: "7" },
  ];
  return (
    <StyledWrapper>
      <StyledHeader>ИТОГИ СБОЯ</StyledHeader>
      <CustomSelect options={options} onChange={(value)=>console.log(value)}/>
      <StyledLine></StyledLine>
    </StyledWrapper>
  )
}
