import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerWrapper = styled.div<{ $inline: boolean }>`
  display: ${(p) => (p.$inline ? "inline-flex" : "flex")};
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-white-text);
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const SpinnerCircle = styled.div<{ $size: number }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  border: 3px solid rgba(0, 255, 174, 0.35);
  border-top-color: var(--color-white-text);
  box-shadow: 0 0 12px rgba(0, 255, 174, 0.35);
  animation: ${spin} 0.9s linear infinite;
`;

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
  inline?: boolean;
}

const LoadingSpinner = ({
  label = "Загрузка...",
  size = 28,
  inline = false,
}: LoadingSpinnerProps) => (
  <SpinnerWrapper $inline={inline}>
    <SpinnerCircle $size={size} />
    {label ? <span>{label}</span> : null}
  </SpinnerWrapper>
);

export default LoadingSpinner;
