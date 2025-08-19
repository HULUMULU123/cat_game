import React from 'react'
import styled from 'styled-components'

const StyledModalLayout = styled.div`
position: fixed;
width: 100vw;
height:100vh;
filter: blur(20px);
background: rgba(0,0,0,0.3);
display: flex;
`

export default function ModalLayout({children}) {
  return (
    <StyledModalLayout>{children}</StyledModalLayout>
  )
}
