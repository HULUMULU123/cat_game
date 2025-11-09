import { useEffect, useMemo } from "react";
import styled from "styled-components";
import RulesHeader from "./RulesHeader";
import ModalName from "../common/ModalName";
import RulesContent from "./RulesContent";
import type { RuleCategory } from "../../home/types";
import DarkLayoutIcon from "./DarkLayoutIcon";

import { request } from "../../../shared/api/httpClient";
import useGlobalStore from "../../../shared/store/useGlobalStore";
import type { RuleCategoryResponse } from "../../../shared/api/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  height: 100vh;
`;

const Placeholder = styled.div`
  width: 92%;
  margin: 10px auto 0;
  color: var(--color-white-text);
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.9;
`;

interface OpenRuleModalProps {
  handleClose: () => void;
  /** объект категории: { id, text, rule } */
  ruleCategory: RuleCategory | null;
}

const safeUpper = (v: unknown) =>
  typeof v === "string" ? v.toUpperCase() : "";
const safeString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const OpenRuleModal = ({ handleClose, ruleCategory }: OpenRuleModalProps) => {
  const tokens = useGlobalStore((s) => s.tokens);

  const categoryTitle = useMemo(() => {
    if (ruleCategory && typeof ruleCategory.text === "string") {
      return ruleCategory.text;
    }
    return "";
  }, [ruleCategory]);
  const initialRuleText = useMemo(() => {
    if (ruleCategory && typeof ruleCategory.rule === "string") {
      return ruleCategory.rule;
    }
    return null;
  }, [ruleCategory]);

  const shouldFetch = Boolean(tokens && ruleCategory && !initialRuleText);

  const {
    data: remoteRuleText,
    isLoading,
    isError,
    error,
  } = useQuery<string | null>({
    queryKey: [
      "rule",
      ruleCategory?.id ?? null,
      safeString(ruleCategory?.text ?? null),
    ],
    enabled: shouldFetch,
    queryFn: async () => {
      if (!tokens || !ruleCategory) return null;
      const name = safeString(ruleCategory.text);
      let list: RuleCategoryResponse[];
      if (name) {
        list = await request<RuleCategoryResponse[]>(
          `/rules/?category=${encodeURIComponent(name)}`,
          { headers: { Authorization: `Bearer ${tokens.access}` } }
        );
      } else {
        list = await request<RuleCategoryResponse[]>(`/rules/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
      }

      let found: RuleCategoryResponse | undefined;

      if (typeof ruleCategory.id === "number") {
        const id = ruleCategory.id;
        found = list.find((r) => r.id === id);
      }

      if (!found && name) {
        const lower = name.toLowerCase();
        found = list.find((r) => r.category.trim().toLowerCase() === lower);
      }

      return found?.rule_text ?? null;
    },
  });

  useEffect(() => {
    if (isError && error) {
      console.error("[OpenRuleModal] rule fetch error", error);
    }
  }, [isError, error]);

  const ruleText = initialRuleText ?? remoteRuleText ?? null;
  const showLoading = shouldFetch && isLoading && !ruleText;
  const showError = shouldFetch && isError && !ruleText;
  const showPlaceholder = shouldFetch && !isLoading && !isError && !ruleText;

  return (
    <StyledWrapper>
      <RulesHeader handleClose={handleClose} />
      <ModalName textName={safeUpper(categoryTitle)} />

      {!ruleCategory ? (
        <Placeholder>Категория правил не выбрана</Placeholder>
      ) : ruleText ? (
        <RulesContent plainText={ruleText} />
      ) : !tokens ? (
        <Placeholder>Авторизуйтесь, чтобы увидеть правило</Placeholder>
      ) : showLoading ? (
        <Placeholder>
          <LoadingSpinner label="Загружаем правило" />
        </Placeholder>
      ) : showError ? (
        <Placeholder>Не удалось загрузить правило</Placeholder>
      ) : showPlaceholder ? (
        <Placeholder>Правило скоро появится</Placeholder>
      ) : (
        <Placeholder>Правило скоро появится</Placeholder>
      )}

      <DarkLayoutIcon />
    </StyledWrapper>
  );
};

export default OpenRuleModal;
