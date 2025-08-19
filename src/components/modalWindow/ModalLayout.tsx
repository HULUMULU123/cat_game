import React from 'react'
import styled from 'styled-components'

const StyledModalLayout = styled.div`
top: 0;
left: 0;
position: fixed;
width: 100vw;
height:100vh;
backdrop-filter: blur(10px);
background: rgba(0,0,0,0.3);
display: flex;
`

export default function ModalLayout({children}) {
  return (
    <StyledModalLayout>{children}</StyledModalLayout>
  )
}
