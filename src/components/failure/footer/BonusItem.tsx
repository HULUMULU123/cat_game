import React from 'react'
import styled, { css } from 'styled-components'

const StyledItem = styled.li<{ $active: boolean }>`
  display: flex;
  width: 90px;
  height: 40px;
  background: ${({ $active }) => ($active ? '#2CC2A9' : css`background: #1FFFE3;
                                                            background: linear-gradient(359deg, rgba(31, 255, 227, 0.37) 0%,
                                                             rgba(0, 223, 152, 0.45) 100%);`)}; 
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 6px;
`

const StyledItemSpan = styled.span`
  color: var(--color-white-text);
  font-family: 'Conthrax', sans-serif;
  font-size: 16px;
  font-weight: 700;
`

const StyledItemAmount = styled.span`
  color: #2CC2A9;
  font-size: 10px;
  font-weight: 700;
  padding: 5px;
  border-radius: 50%;
  position: absolute;
  top: -10px;
  right: -10px;
`

interface BonusItemProps {
  amount: number
}

export default function BonusItem({ amount }: BonusItemProps) {
  return (
    <StyledItem $active={amount > 0}>
      <StyledItemSpan>x 10</StyledItemSpan>
      {amount > 0 && <StyledItemAmount>{amount}</StyledItemAmount>}
    </StyledItem>
  )
}

