import React, { useState } from 'react'
import styled from 'styled-components'
import submit from '../../../assets/icons/submit.svg'
import useGlobalStore from '../../../shared/store/useGlobalStore'
// Полупрозрачный фон модалки
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

// Контейнер с формой и статусом
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

// Горизонтальная форма ввода промокода
const StyledPromoForm = styled.form`
    display: flex;
    align-items: center;
    gap: 10px;
`

// Инпут под промокод с минимальными стилями
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

// Кнопка отправки (иконка)
const StyledPromoSubmit = styled.button`
background: transparent;
border: none;
width: 25px;
height: 25px;`

const StyledSubmitImg = styled.img`
width:100%;
height: 100%;`
// Строка статуса под формой
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

// Модальное окно для активации промокода
export default function PromoModal({handleCloseModal}) {
  // Берем экшен из глобального стора
  const redeemPromoCode = useGlobalStore((state) => state.redeemPromoCode);
  // Значение инпута
  const [value, setValue] = useState('');
  // Статус запроса для UI
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // Сообщение пользователю
  const [message, setMessage] = useState('');

  // Отправка промокода на сервер
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Защита от повторной отправки
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
      // Переводим типовые сообщения в понятный текст для пользователя
      if (error instanceof Error) {
        const msg = error.message.trim().toLowerCase();
        if (msg.includes('не найден')) {
          setMessage('Промокод не найден');
          return;
        }
        if (msg.includes('уже был активирован')) {
          setMessage('Этот промокод уже активирован вашим профилем');
          return;
        }
        setMessage(error.message);
        return;
      }
      setMessage('Промокод не найден');
    }
  };

  return (
    // Закрываем модалку при клике по фону
    <StyledLayout onClick={()=>handleCloseModal(false)}>
        {/* Останавливаем всплытие, чтобы клик внутри не закрывал модалку */}
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
        {/* Показываем статус после первой попытки */}
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
