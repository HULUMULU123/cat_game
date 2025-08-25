import React from 'react'
import styled from 'styled-components'
import { CustomSelect } from './CustomSelect'

const StyledWrapper = styled.div`
    width: 100%;
    display: flex;
    margin: 0 auto;
    align-items: center;
`

const StyledHeader = styled.h3``


export default function PrevContentHeader() {
    const options = [
    { label: "23 / 05 / 2025", value: "1" },
    { label: "23 / 05 /2024", value: "2" },
    { label: "23 / 05 / 2023", value: "2" },
  ];
  return (
    <StyledWrapper><CustomSelect options={options} onChange={(value)=>console.log(value)}/></StyledWrapper>
  )
}
