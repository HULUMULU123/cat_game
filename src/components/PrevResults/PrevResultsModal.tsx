import React from 'react'
import Header from './Header'
import styled from 'styled-components'

const StyledLayout = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;
    background: rgba(0,0,0,.5);
    display: flex;
    flex-direction: column;
    align-items: center;
`
export default function PrevResultsModal({handleClose}) {

    const closeModal = () =>
        handleClose(false)
  return (
    <StyledLayout>
        <Header handleClose={closeModal}/>
    </StyledLayout>
  )
}
