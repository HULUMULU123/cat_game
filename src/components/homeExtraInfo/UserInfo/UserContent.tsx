import React, { useState } from 'react'
import UserBalance from './UserBalance'
import UserStatistics from './UserStatistics'
import styled from 'styled-components'
import Promocode from './Promocode'
import PromoModal from './PromoModal'

const StyledWrapper = styled.div`
display: flex;
flex-direction: column;
align-items:center;
width: 95%;
margin: 0 auto;
gap: 20px;
`
export default function UserContent() {
  const [isOpneModal, setIsOpenModal] = useState(false);
  return (
    <StyledWrapper>
        <UserBalance/>
        <UserStatistics/>
        <Promocode handleOpenModal={setIsOpenModal}/>
        {isOpneModal ? <PromoModal handleCloseModal={setIsOpenModal}/> : null}
    </StyledWrapper>
  )
}
