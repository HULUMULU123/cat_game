import React, { useState } from 'react'
import styled from 'styled-components'
import submit from '../../../assets/icons/submit.svg'
import useGlobalStore from '../../../shared/store/useGlobalStore'
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
    width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 20px;
`

const StyledPromoForm = styled.form`
    display: flex;
    align-items: center;
    gap: 10px;
`

const StyledPromoInput = styled.input`
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
  -webkit-appearance: none; /* убираем дефолтные стили iOS */
  appearance: none;

  color: #fff;
  font-size: 14px;
  padding: 7px;
  

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
const StyledStatus = styled.span<{ $state: 'success' | 'error' | 'loading' }>`
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: ${({ $state }) => {
    switch ($state) {
      case 'success':
        return '#e7fff6';
      case 'error':
        return '#ffe0e0';
      default:
        return '#fff';
    }
  }};
  display: block;
  margin-top: 8px;
  text-align: center;
`;

export default function PromoModal({handleCloseModal}) {
  const redeemPromoCode = useGlobalStore((state) => state.redeemPromoCode);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;
    try {
      setStatus('loading');
      setMessage('');
      const result = await redeemPromoCode(value);
      setStatus('success');
      setMessage(result.detail);
      setValue('');
    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        const msg = error.message.trim().toLowerCase();
        if (msg.includes('не найден')) {
          setMessage('Промокод не найден');
          return;
        }
        setMessage(error.message);
        return;
      }
      setMessage('Промокод не найден');
    }
  };

  return (
    <StyledLayout onClick={()=>handleCloseModal(false)}>
        <StyledPromoWrapper onClick={(e) => e.stopPropagation()}>
            <StyledPromoForm onSubmit={handleSubmit}>
                <StyledPromoInput
                  name='promo'
                  placeholder='ПРОМОКОД'
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  disabled={status === 'loading'}
                />
            <StyledPromoSubmit type='submit' disabled={status === 'loading'}>
              <StyledSubmitImg src={submit}/>
            </StyledPromoSubmit>
        </StyledPromoForm>
        {status !== 'idle' ? (
          <StyledStatus $state={status === 'error' ? 'error' : status === 'success' ? 'success' : 'loading'}>
            {status === 'loading'
              ? 'Проверяем...'
              : status === 'success'
              ? message || 'Промокод применен'
              : message || 'Промокод не применен'}
          </StyledStatus>
        ) : null}
    </StyledPromoWrapper>
</StyledLayout>
  )
}
