import React, { useState } from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SelectBox = styled.div`
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 16px;
  min-width: 180px;
  z-index: 10;
`;

const OptionsList = styled.ul<{ open: boolean }>`
  position: absolute;
  top: calc(100% + 20px); /* отступ 20px */
  left: 0;
  right: 0;

  background: #fff;
  border-radius: 10px;
  border: 1px solid #ddd;
  list-style: none;
  margin: 0;
  padding: 8px 0;

  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1);

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
`;

const OptionItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

/* Размытие заднего фона */
const Backdrop = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? "block" : "none")};
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
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
  const [selected, setSelected] = useState<Option | null>(null);

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    setOpen(false);
    onChange(opt.value);
  };

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} />
      <Wrapper>
        <SelectBox onClick={() => setOpen((prev) => !prev)}>
          {selected ? selected.label : "Выберите опцию"}
        </SelectBox>
        <OptionsList open={open}>
          {options.map((opt) => (
            <OptionItem key={opt.value} onClick={() => handleSelect(opt)}>
              {opt.label}
            </OptionItem>
          ))}
        </OptionsList>
      </Wrapper>
    </>
  );
};
