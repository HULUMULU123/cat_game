import { Fragment, useMemo } from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  margin: 20px auto;
  gap: 15px;
  position: relative;
  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: content-box;
  scrollbar-width: thin;
  scrollbar-color: #e1fffb #2cc2a9;
  height: 75vh;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #2cc2a9;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e1fffb;
    border-radius: 20px;
  }
`;

const StyledListHeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 90%;
`;

const StyledLine = styled.span`
  display: block;
  width: 100%;
  height: 1px;
  background: #85fff0;
  border-radius: 10px;
`;

const StyledHeadingSpan = styled.span`
  color: #fff;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
`;

const StyledRulesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 90%;
  font-family: "Conthrax", sans-serif;
  color: rgb(158, 189, 185);
`;

const StyledRulesHeading = styled.h3`
  margin: 20px 0 15px;
  padding: 0;
  font-size: 14px;
  font-weight: 700;
`;

const StyledRule = styled.p`
  margin: 5px 0;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
`;

const StyledPlainText = styled.div`
  width: 90%;
  font-family: "Roboto", sans-serif;
  color: rgb(224, 255, 251);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap; /* сохраняем переносы строк */
`;

// ----- типы -----
type RulesContentValue = string[] | Record<string, string[]>;

export interface RulesContentProps {
  /** Структурированные правила (старый формат JSON) */
  rulesData?: Record<string, RulesContentValue>;
  /** Плоский текст правила (новый формат из бэка) */
  plainText?: string | null;
}

// ----- helpers рендера -----
const renderRulesArray = (rules: string[]) =>
  rules.map((rule, index) => (
    <StyledRule key={rule + index}>{rule}</StyledRule>
  ));

const renderNestedRules = (sections: Record<string, string[]>) =>
  Object.entries(sections).map(([subtitle, rules]) => (
    <div key={subtitle}>
      <StyledRulesHeading>{subtitle}</StyledRulesHeading>
      {renderRulesArray(rules)}
    </div>
  ));

const RulesContent = ({ rulesData, plainText }: RulesContentProps) => {
  const hasStructured = useMemo(
    () => rulesData && Object.keys(rulesData).length > 0,
    [rulesData]
  );
  const hasPlain = useMemo(
    () => typeof plainText === "string" && plainText.trim().length > 0,
    [plainText]
  );

  // 1) Если есть структурированные данные — рендерим их (как раньше)
  if (hasStructured && rulesData) {
    return (
      <StyledWrapper>
        {Object.entries(rulesData).map(([sectionTitle, sectionValue]) => (
          <Fragment key={sectionTitle}>
            <StyledListHeadingWrapper>
              <StyledHeadingSpan>{sectionTitle}</StyledHeadingSpan>
              <StyledLine />
            </StyledListHeadingWrapper>
            <StyledRulesWrapper>
              {Array.isArray(sectionValue)
                ? renderRulesArray(sectionValue)
                : renderNestedRules(sectionValue)}
            </StyledRulesWrapper>
          </Fragment>
        ))}
      </StyledWrapper>
    );
  }

  // 2) Если есть простой текст из бэка — показываем его
  if (hasPlain && typeof plainText === "string") {
    return (
      <StyledWrapper>
        <StyledPlainText>{plainText}</StyledPlainText>
      </StyledWrapper>
    );
  }

  // 3) Ничего не передали
  return (
    <StyledWrapper>
      <StyledPlainText>Правило скоро появится.</StyledPlainText>
    </StyledWrapper>
  );
};

export default RulesContent;
