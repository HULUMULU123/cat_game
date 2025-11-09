import styled from 'styled-components'
import { CustomSelect } from './CustomSelect'

const StyledWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    align-items: center;
    gap: 15px;
`

const StyledHeader = styled.h3`
font-family: 'Conthrax', sans-serif;
font-size: 22px;
color: var(--color-white-text);
font-weight: 700;
margin: 0;
padding: 0;
text-align: center;

`

const StyledLine = styled.span`
display: block;
width: 100%;
height: 2px;
background: #85FFF0;

`

interface PrevContentHeaderProps {
  options: { label: string; value: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  isLoading?: boolean;
}

export default function PrevContentHeader({
  options,
  selectedValue,
  onSelect,
  isLoading = false,
}: PrevContentHeaderProps) {
  const placeholder = isLoading
    ? 'Загрузка...'
    : options.length
    ? 'Выберите дату'
    : 'Нет завершённых сбоев';

  return (
    <StyledWrapper>
      <StyledHeader>ИТОГИ СБОЯ</StyledHeader>
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={onSelect}
        placeholder={placeholder}
        disabled={isLoading || options.length === 0}
      />
      <StyledLine></StyledLine>
    </StyledWrapper>
  )
}
