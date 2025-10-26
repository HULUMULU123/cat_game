import styled from "styled-components";
import RulesHeader from "./RulesHeader";
import ModalName from "../common/ModalName";

import RulesContent from "./RulesContent";
import type { RulesContentProps } from "./RulesContent";
import data from "../../../assets/data/stakan_rules.json";
import type { RuleCategory } from "../../home/types";

import DarkLayoutIcon from "./DarkLayoutIcon";

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100vh;
`;

const StyledRuleText = styled.div`
  width: 92%;
  margin: 10px auto 0;
  color: var(--color-white-text);
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap; /* сохраняем переносы строк */
  opacity: 0.9;
`;

interface OpenRuleModalProps {
  handleClose: () => void;
  /** объект категории из бэка: { id, text, rule } */
  ruleCategory: RuleCategory;
}

/** Локальные (старые) структурированные правила как резерв */
const rulesData = data as Record<string, RulesContentProps["rulesData"]>;

/** Безопасные хелперы */
const safeUpper = (v: unknown) =>
  typeof v === "string" ? v.toUpperCase() : "";
const safeString = (v: unknown) => (typeof v === "string" ? v : "");

const pickLegacyRules = (
  text: string | undefined
): RulesContentProps["rulesData"] | undefined => {
  if (!text) return undefined;
  const keyVariants = [
    text,
    text.trim(),
    text.toUpperCase(),
    text.toLowerCase(),
    text.trim().toUpperCase(),
    text.trim().toLowerCase(),
  ];

  for (const k of keyVariants) {
    if (k in rulesData) {
      return rulesData[k];
    }
  }
  return undefined;
};

const OpenRuleModal = ({ handleClose, ruleCategory }: OpenRuleModalProps) => {
  // Заголовок секции
  const categoryTitle =
    typeof (ruleCategory as any)?.text === "string"
      ? (ruleCategory as any).text
      : typeof ruleCategory === "string"
      ? ruleCategory
      : "";

  // Текст правила из бэка
  const backendRuleText =
    typeof (ruleCategory as any)?.rule === "string"
      ? ((ruleCategory as any).rule as string)
      : "";

  // Пытаемся найти структурированный контент в локальном JSON
  const legacyRules = pickLegacyRules(safeString((ruleCategory as any)?.text));

  // Если есть контент из старого JSON — показываем его (как раньше)
  if (legacyRules) {
    return (
      <StyledWrapper>
        <RulesHeader handleClose={handleClose} />
        <ModalName textName={safeUpper(categoryTitle)} />
        <RulesContent rulesData={legacyRules} />
        <DarkLayoutIcon />
      </StyledWrapper>
    );
  }

  // Иначе — показываем плоский текст правила из бэка (или плейсхолдер)
  return (
    <StyledWrapper>
      <RulesHeader handleClose={handleClose} />
      <ModalName textName={safeUpper(categoryTitle)} />
      <StyledRuleText>
        {backendRuleText || "Правило скоро появится"}
      </StyledRuleText>
      <DarkLayoutIcon />
    </StyledWrapper>
  );
};

export default OpenRuleModal;
