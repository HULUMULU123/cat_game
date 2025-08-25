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
justify-content: center;
height: 100vh;
width: 100vw;`

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
  -webkit-appearance: none; /* убираем дефолтные стили iOS */
  appearance: none;

  color: #fff;
  font-size: 16px;
  padding: 7px 0;
  width: 200px;

  border: none;
  border-bottom: 2px dotted #fff;
  background: transparent;
  outline: none;

  transition: border-bottom-color 0.2s ease, border-bottom-style 0.2s ease;

  &::placeholder {   /* важно: именно &::placeholder */
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
  }

  &:focus {
    border-bottom: 2px solid #fff;
  }
`;

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
                <StyledPromoInput name='promo' placeholder='ПРОМОКОД'/>
                <StyledPromoSubmit><StyledSubmitImg src={submit}/></StyledPromoSubmit>
            </StyledPromoForm>
        </StyledPromoWrapper>
    </StyledLayout>
  )
}
