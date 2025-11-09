import React, { useMemo } from "react";
import styled from "styled-components";
import ModalLayout from "../../modalWindow/ModalLayout";
import type { FailureBonusType } from "../../../shared/api/types";

const ShopCard = styled.div`
  width: 85vw;
  max-width: 420px;
  background: rgba(18, 82, 72, 0.96);
  border-radius: 16px;
  padding: 24px 20px;
  color: #dff8f2;
  font-family: "Conthrax", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  text-transform: uppercase;
  color: #85fff0;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 11px;
  text-align: center;
  color: rgba(212, 255, 245, 0.75);
`;

const BalanceBox = styled.div`
  background: rgba(16, 58, 50, 0.9);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
`;

const ItemCard = styled.div<{ $disabled: boolean }>`
  background: rgba(13, 52, 46, 0.9);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  border: 1px solid rgba(133, 255, 240, 0.18);
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemTitle = styled.span`
  font-size: 14px;
  color: #f0fffb;
  text-transform: uppercase;
`;

const PriceTag = styled.span`
  font-size: 12px;
  color: #85fff0;
`;

const ItemDescription = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(214, 255, 247, 0.78);
  text-transform: uppercase;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusText = styled.span`
  font-size: 10px;
  color: rgba(188, 255, 239, 0.7);
  text-transform: uppercase;
`;

const ActionButton = styled.button<{ $variant: "primary" | "ghost" }>`
  border: none;
  border-radius: 8px;
  font-family: "Conthrax", sans-serif;
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 8px 16px;
  cursor: pointer;
  background: ${({ $variant }) =>
    $variant === "primary"
      ? "linear-gradient(140deg, rgba(66, 214, 182, 0.95) 0%, rgba(29, 140, 116, 0.95) 100%)"
      : "rgba(18, 60, 53, 0.7)"};
  color: ${({ $variant }) => ($variant === "primary" ? "#0b3e36" : "#bff8ee")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SlotsInfo = styled.span`
  font-size: 10px;
  text-align: center;
  color: rgba(199, 247, 238, 0.7);
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-family: "Conthrax", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  color: #0b3e36;
  background: linear-gradient(160deg, rgba(135, 255, 224, 0.95) 0%, rgba(63, 206, 176, 0.85) 100%);
  cursor: pointer;
`;

const ErrorText = styled.span`
  color: #ffb3b3;
  font-size: 10px;
  text-align: center;
  text-transform: uppercase;
`;

const BONUS_TEXTS: Record<FailureBonusType, { title: string; description: string }> = {
  x2: { title: "x2", description: "Умножение капель на 10 секунд" },
  x5: { title: "x5", description: "Умножение капель на 10 секунд" },
  x10: { title: "x10", description: "Умножение капель на 10 секунд" },
  freeze: { title: "Заморозка", description: "Капли падают медленнее 10 секунд" },
  no_bombs: { title: "Без бомб", description: "Удаляет опасные капли" },
};

interface FailureShopProps {
  isOpen: boolean;
  onClose: () => void;
  bonusPrices: Record<FailureBonusType, number>;
  purchasedBonuses: FailureBonusType[];
  maxBonuses: number;
  onPurchase: (type: FailureBonusType) => void;
  purchasingType: FailureBonusType | null;
  balance: number;
  error?: string | null;
}

const FailureShop = ({
  isOpen,
  onClose,
  bonusPrices,
  purchasedBonuses,
  maxBonuses,
  onPurchase,
  purchasingType,
  balance,
  error,
}: FailureShopProps) => {
  const slotsLeft = Math.max(maxBonuses - purchasedBonuses.length, 0);
  const items = useMemo(() => Object.keys(bonusPrices) as FailureBonusType[], [bonusPrices]);

  const handleBackdropClose = (value: boolean) => {
    if (!value) onClose();
  };

  return (
    <ModalLayout isOpen={isOpen} setIsOpen={handleBackdropClose}>
      <ShopCard onClick={(event) => event.stopPropagation()}>
        <Header>
          <Title>магазин сбоя</Title>
          <Subtitle>выбери до {maxBonuses} бонусов перед стартом</Subtitle>
        </Header>

        <BalanceBox>
          <span>баланс</span>
          <span>{balance} crash</span>
        </BalanceBox>

        <ItemsList>
          {items.map((type) => {
            const price = bonusPrices[type] ?? 0;
            const { title, description } = BONUS_TEXTS[type] ?? {
              title: type,
              description: "",
            };
            const alreadyPurchased = purchasedBonuses.includes(type);
            const disabled = alreadyPurchased || slotsLeft === 0;
            const isLoading = purchasingType === type;

            return (
              <ItemCard key={type} $disabled={disabled}>
                <ItemHeader>
                  <ItemTitle>{title}</ItemTitle>
                  <PriceTag>{price} crash</PriceTag>
                </ItemHeader>
                <ItemDescription>{description}</ItemDescription>
                <ItemFooter>
                  <StatusText>
                    {alreadyPurchased ? "куплено" : disabled ? "лимит" : "доступно"}
                  </StatusText>
                  <ActionButton
                    type="button"
                    $variant="primary"
                    disabled={disabled || isLoading}
                    onClick={() => onPurchase(type)}
                  >
                    {alreadyPurchased ? "готов" : isLoading ? "..." : "купить"}
                  </ActionButton>
                </ItemFooter>
              </ItemCard>
            );
          })}
        </ItemsList>

        <Footer>
          <SlotsInfo>свободных слотов: {slotsLeft}</SlotsInfo>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <CloseButton type="button" onClick={onClose}>
            начать сбой
          </CloseButton>
        </Footer>
      </ShopCard>
    </ModalLayout>
  );
};

export default FailureShop;
