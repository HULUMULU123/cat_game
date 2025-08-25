import React from 'react'
import styled from 'styled-components'
import submit from '../../../assets/icons/submit.svg'
const StyledLayout = styled.div`
position: fixed;
top:0;
left: 0;
z-index:9999;
background: rgba(0,0,0,0.4);
display: flex;
align-items: center;
justify-content: center;`

const StyledPromoWrapper = styled.div`
    background: #28B092;
    border-radius: 7px;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 7px 15px;
`

const StyledPromoForm = styled.form`
    display: flex;
    align-items: center;
    gap: 10px;
`

const StyledPromoInput = styled.input`
color: #fff;
padding:7px;
border-bottom: 1px dotted #fff;`

const StyledPromoSubmit = styled.button`
background: transparent;
border: none;
width: 25px;
height: 25px;`

const StyledSubmitImg = styled.img`
width:100%;
height: 100%;`
export default function PromoModal({handleCloseModal}) {
  return (
    <StyledLayout onClick={()=>handleCloseModal(false)}>
        <StyledPromoWrapper onClick={(e) => e.stopPropagation()}>
            <StyledPromoForm>
                <StyledPromoInput/>
                <StyledPromoSubmit><StyledSubmitImg src={submit}/></StyledPromoSubmit>
            </StyledPromoForm>
        </StyledPromoWrapper>
    </StyledLayout>
  )
}
