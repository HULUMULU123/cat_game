import React from "react";
import styled from "styled-components";
import BonusItem, { BonusStatus } from "./BonusItem";
import type { FailureBonusType } from "../../../shared/api/types";

const StyledList = styled.ul`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-around;
  padding: 0;
  margin: 15px 0;
  list-style: none;
  gap: 12px;
`;

export interface BonusListEntry {
  type: FailureBonusType;
  status: BonusStatus;
  highlight?: boolean;
}

interface BonusListProps {
  bonuses: BonusListEntry[];
  onActivate?: (type: FailureBonusType) => void;
}

export default function BounusList({ bonuses, onActivate }: BonusListProps) {
  if (!bonuses.length) {
    return null;
  }

  return (
    <StyledList>
      {bonuses.map((bonus) => (
        <BonusItem
          key={bonus.type}
          type={bonus.type}
          status={bonus.status}
          onActivate={onActivate}
          showBadge={bonus.highlight}
        />
      ))}
    </StyledList>
  );
}
