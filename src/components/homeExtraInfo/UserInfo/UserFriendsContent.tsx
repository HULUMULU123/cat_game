import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import useGlobalStore from "../../../shared/store/useGlobalStore";

const StyledFriendsContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  gap: 20px;
`;

const StyledStatisticsSpanWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: end;
`;

const StyledStatisticsSpan = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 11px;
  font-weight: 200;
  color: var(--color-white-text);
`;

const StyledStatistcPoints = styled.span`
  flex-grow: 1;
  border-bottom: 1px dotted var(--color-white-text);
  margin: 0 5px;
`;

const StyledStatisticResultSpan = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-white-text);
`;

const StyledReferralBlock = styled.div`
  width: 100%;
  background: rgba(18, 99, 88, 0.35);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledLabel = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  color: var(--color-white-text);
  opacity: 0.8;
  margin-bottom: 5px;
`;

const StyledCodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(79, 197, 191, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
  gap: 12px;
`;

const StyledCode = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 18px;
  color: var(--color-white-text);
  letter-spacing: 2px;
`;

const StyledCopyButton = styled.button`
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #0c2f29;
  background: #85fff0;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledInput = styled.input`
  width: 92%;
  border-radius: 8px;
  border: none;
  padding: 10px 14px;
  font-size: 14px;
  font-family: "Roboto", sans-serif;
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white-text);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const StyledSubmitButton = styled.button<{ $secondary?: boolean }>`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${({ $secondary }) => ($secondary ? "#0c2f29" : "#ffffff")};
  background: ${({ $secondary }) =>
    $secondary
      ? "#85fff0"
      : "linear-gradient(90deg, #4fc5bf 0%, #2cc2a9 100%)"};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: opacity 0.2s ease;

  &:disabled {
    cursor: default;
  }
`;

const StyledStatus = styled.span<{ $type: "success" | "error" }>`
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  color: ${({ $type }) => ($type === "success" ? "#85fff0" : "#ff9f9f")};
  min-height: 16px;
`;

const StyledHint = styled.span`
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
`;

export default function UserFriendsContent() {
  const referralCode = useGlobalStore((state) => state.referralCode);
  const referralsCount = useGlobalStore((state) => state.referralsCount);
  const referredByCode = useGlobalStore((state) => state.referredByCode);
  const submitReferralCode = useGlobalStore(
    (state) => state.submitReferralCode
  );

  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReferralLocked = useMemo(
    () => Boolean(referredByCode),
    [referredByCode]
  );

  const handleCopy = useCallback(async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setStatus({ type: "success", message: "Код скопирован в буфер обмена" });
    } catch (error) {
      setStatus({ type: "error", message: "Не удалось скопировать код" });
    }
  }, [referralCode]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => {
      setStatus(null);
      setCopied(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputCode.trim()) {
        setStatus({ type: "error", message: "Введите реферальный код" });
        return;
      }
      if (isReferralLocked) {
        setStatus({ type: "error", message: "Код уже активирован" });
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitReferralCode(inputCode);
        setStatus({ type: "success", message: result.detail });
        setInputCode("");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось активировать код";
        setStatus({ type: "error", message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [inputCode, isReferralLocked, submitReferralCode]
  );

  return (
    <StyledFriendsContent>
      <StyledStatisticsSpanWrapper>
        <StyledStatisticsSpan>ПРИГЛАШЕНО ДРУЗЕЙ</StyledStatisticsSpan>
        <StyledStatistcPoints></StyledStatistcPoints>
        <StyledStatisticResultSpan>
          {referralsCount.toLocaleString("ru-RU")}
        </StyledStatisticResultSpan>
      </StyledStatisticsSpanWrapper>

      <StyledReferralBlock>
        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <StyledLabel>Ваш реферальный код</StyledLabel>
          <StyledCodeRow>
            <StyledCode>{referralCode ?? "—"}</StyledCode>
            <StyledCopyButton
              onClick={handleCopy}
              disabled={!referralCode}
              type="button"
            >
              {copied ? "Скопировано" : "Копировать"}
            </StyledCopyButton>
          </StyledCodeRow>
        </div>

        <StyledForm onSubmit={handleSubmit}>
          <StyledLabel>Активировать код друга</StyledLabel>
          <StyledInput
            value={inputCode}
            onChange={(event) => setInputCode(event.target.value.toUpperCase())}
            placeholder="Введите код"
            disabled={isReferralLocked || isSubmitting}
            maxLength={16}
          />
          <StyledSubmitButton
            type="submit"
            disabled={isReferralLocked || isSubmitting}
          >
            {isReferralLocked ? "Код активирован" : "Активировать"}
          </StyledSubmitButton>
        </StyledForm>

        {referredByCode ? (
          <StyledHint>Вы активировали код: {referredByCode}</StyledHint>
        ) : null}
        <StyledStatus $type={status?.type ?? "success"}>
          {status?.message ?? ""}
        </StyledStatus>
      </StyledReferralBlock>
    </StyledFriendsContent>
  );
}
