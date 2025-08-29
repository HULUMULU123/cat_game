import React, { useState } from "react";
import styled, { css } from "styled-components";
import drop_down from '../../assets/icons/drop_down.svg'

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SelectBox = styled.div`
  padding: 6px 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  
  min-width: 160px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledBoxSpan = styled.span`
  font-size: 16px;
  color: #2CC2A9;
  font-weight: 700;
`

const StyledSelectImg = styled.img`
  width: 20px;
  height: 20px;
`
const OptionListWrapper = styled.div<{ open: boolean }>`
z-index: 1;
  position: absolute;
  top: calc(100% + 20px);
  left: 0;
  right: 0;
  background: #27AE91;
  border-radius: 7px;
  margin: 0;
  padding: 8px 0;
  height: 120px;
  width: 200px;

  ${({ open }) =>
    open
      ? css`
          display: block;
          animation: fadeIn 0.2s ease forwards;
        `
      : css`
          display: none;
        `}

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const OptionsList = styled.ul`
  

  
  margin: auto;
  padding: 0;
  height: 100%;
  width: 90%;
  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: content-box;

  scrollbar-width: thin;
  scrollbar-color: #E1FFFB #2CC2A9; 
  &::-webkit-scrollbar {
    width: 4px; 
  }
  &::-webkit-scrollbar-track {
    background: #2CC2A9;  
    border-radius: 10px;
    
  }
  &::-webkit-scrollbar-thumb {
    background: #E1FFFB;  
    border-radius: 20px;
  }

  

  
`;

const OptionItem = styled.li<{ selected?: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center; 
  justify-content: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-white-text);

  ${({ selected }) =>
    selected &&
    css`
      border-bottom: 2px solid #fff;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 2;
    `}

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Backdrop = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? "block" : "none")};
  position: fixed;
  inset: 0;
  background: rgba(39, 174, 145, 0.2);
  backdrop-filter: blur(3px);
  z-index: 1;
`;

type Option = { label: string; value: string };

interface CustomSelectProps {
  options: Option[];
  onChange: (value: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(
    options.length > 0 ? options[options.length - 1] : null
  );

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    setOpen(false);
    onChange(opt.value);
  };

  // Сначала выбранный элемент, потом остальные
  const sortedOptions = selected
    ? [selected, ...options.filter((opt) => opt.value !== selected.value)]
    : options;

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} />
      <Wrapper>
        <SelectBox onClick={() => setOpen((prev) => !prev)}>
          <StyledBoxSpan>{selected ? selected.label : "Выберите дату"}</StyledBoxSpan>
          <StyledSelectImg src={drop_down}/>
        </SelectBox>
        <OptionListWrapper open={open}>
        <OptionsList >
          {sortedOptions.map((opt) => (
            <OptionItem
              key={opt.value}
              selected={selected?.value === opt.value}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </OptionItem>
          ))}
        </OptionsList>
        </OptionListWrapper>
      </Wrapper>
    </>
  );
};
