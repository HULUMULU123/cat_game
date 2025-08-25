import React from 'react'
import Header from './Header'
import styled from 'styled-components'

const StyledLayout = styled.div`
    position: fixed;
    top: 0;
    left:0;
    height: 100vh;
    width: 100vw;
    background: rgba(0,0,0,.7);
    backdrop-filter: filter(2px);
    z-index:999999;
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
