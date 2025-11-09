import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import type { FailureBonusType } from "../../../shared/api/types";

const StyledItem = styled.li<{ $status: BonusStatus }>`
  display: flex;
  width: 90px;
  height: 40px;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 6px;
  cursor: ${({ $status }) => ($status === "available" ? "pointer" : "default")};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  ${({ $status }) => {
    switch ($status) {
      case "active":
        return css`
          background: linear-gradient(
            120deg,
            rgba(44, 194, 169, 0.95) 0%,
            rgba(0, 132, 110, 0.9) 100%
          );
          box-shadow: 0 0 18px rgba(44, 194, 169, 0.55);
        `;
      case "used":
        return css`
          background: rgba(36, 70, 64, 0.6);
          opacity: 0.6;
        `;
      default:
        return css`
          background: linear-gradient(
            359deg,
            rgba(31, 255, 227, 0.17) 0%,
            rgba(0, 223, 152, 0.25) 100%
          );
          border: 1px solid rgba(44, 194, 169, 0.4);
        `;
    }
  }};

  &:hover {
    ${({ $status }) =>
      $status === "available"
        ? css`
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(44, 194, 169, 0.35);
          `
        : null};
  }
`;

const StyledItemSpan = styled.span<{ $status: BonusStatus }>`
  color: ${({ $status }) =>
    $status === "used" ? "rgba(160, 200, 195, 0.6)" : "var(--color-white-text)"};
  font-family: "Conthrax", sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
`;

const StyledBadge = styled.span`
  color: #2cc2a9;
  font-size: 10px;
  font-weight: 700;
  min-width: 20px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
`;

const StyledStatus = styled.span`
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-family: "Conthrax", sans-serif;
  color: rgba(199, 247, 238, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export type BonusStatus = "available" | "active" | "used";

const LABELS: Record<FailureBonusType, string> = {
  x2: "x2",
  x5: "x5",
  x10: "x10",
  freeze: "freeze",
  no_bombs: "no bomb",
};

interface BonusItemProps {
  type: FailureBonusType;
  status: BonusStatus;
  onActivate?: (type: FailureBonusType) => void;
  showBadge?: boolean;
}

export default function BonusItem({
  type,
  status,
  onActivate,
  showBadge,
}: BonusItemProps) {
  const label = LABELS[type] ?? type;
  const handleClick = () => {
    if (status !== "available") return;
    onActivate?.(type);
  };

  const statusLabel = useMemo(() => {
    switch (status) {
      case "active":
        return "активен";
      case "used":
        return "использован";
      default:
        return "готов";
    }
  }, [status]);

  return (
    <StyledItem $status={status} onClick={handleClick} role="button">
      <StyledItemSpan $status={status}>{label}</StyledItemSpan>
      {showBadge && status === "available" ? <StyledBadge>!</StyledBadge> : null}
      <StyledStatus>{statusLabel}</StyledStatus>
    </StyledItem>
  );
}
