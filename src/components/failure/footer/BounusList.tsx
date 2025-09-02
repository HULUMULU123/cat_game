import React from 'react'
import styled from 'styled-components'
import BonusItem from './BonusItem'

const StyledList = styled.ul`
display: flex;
align-items: center;
width: 100%;
justify-content: space-around;
padding: 0;
margin: 0;`
export default function BounusList() {
  return (
    <StyledList>
        <BonusItem amount={4} />
        <BonusItem amount={0} />
        <BonusItem amount={5} />
    </StyledList>
  )
}
