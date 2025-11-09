import { useEffect, useMemo } from "react";
import styled from "styled-components";
import RulesItem from "./RulesItem";

import logoCircle from "../../../assets/rules_icons/logo_circle.svg";

import { request } from "../../../shared/api/httpClient";
import useGlobalStore from "../../../shared/store/useGlobalStore";
import type { RuleCategoryResponse } from "../../../shared/api/types";
import type { RuleCategory } from "../../home/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  margin: 20px auto;
  gap: 15px;
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

const StyledRulesList = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  padding: 0;
  margin: 0;
  width: 95%;

  @media (max-width: 540px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
`;

const Placeholder = styled.div`
  color: #c7f7ee;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  text-align: center;
  margin: 20px 0;
`;

interface RulesListProps {
  openRuleCategory: (category: RuleCategory) => void;
}

/** Подбор иконки по названию категории */
const pickIcon = (candidate: string | null, fallbackName: string): string => {
  const provided = candidate?.trim();
  if (provided) return provided;

  const n = fallbackName.toLowerCase();
  if (n.includes("стакан")) return logoCircle;
  return logoCircle;
};

/** Трансформируем ответ бэка к вашему типу RuleCategory */
const toRuleCategory = (r: RuleCategoryResponse): RuleCategory => ({
  id: r.id,
  text: r.category,
  rule: r.rule_text,
  icon: r.icon,
});

const RulesList = ({ openRuleCategory }: RulesListProps) => {
  const tokens = useGlobalStore((s) => s.tokens);
  const {
    data: ruleCategories,
    isLoading,
    isError,
    error,
  } = useQuery<RuleCategoryResponse[]>({
    queryKey: ["rules", tokens?.access ?? null],
    queryFn: async () => {
      if (!tokens) return [];
      return request<RuleCategoryResponse[]>("/rules/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
    enabled: Boolean(tokens),
  });

  useEffect(() => {
    if (isError && error) {
      console.error("[Rules] fetch error:", error);
    }
  }, [isError, error]);

  const rules = ruleCategories ?? [];

  const content = useMemo(() => {
    if (!tokens) {
      return <Placeholder>Авторизуйтесь, чтобы увидеть правила</Placeholder>;
    }
    if (isLoading)
      return (
        <Placeholder>
          <LoadingSpinner label="Загружаем правила" />
        </Placeholder>
      );
    if (isError)
      return <Placeholder>Не удалось загрузить правила</Placeholder>;
    if (!rules.length)
      return <Placeholder>Правила пока не добавлены</Placeholder>;

    return (
      <StyledRulesList>
        {rules.map((r) => {
          const category = toRuleCategory(r);
          return (
            <RulesItem
              key={r.id}
              icon={pickIcon(category.icon ?? null, category.text)}
              category={category}
              handleClick={openRuleCategory}
            />
          );
        })}
      </StyledRulesList>
    );
  }, [isError, isLoading, openRuleCategory, rules, tokens]);

  return (
    <StyledWrapper>
      <StyledListHeadingWrapper>
        <StyledHeadingSpan>КАТЕГОРИИ</StyledHeadingSpan>
        <StyledLine />
      </StyledListHeadingWrapper>

      {content}
    </StyledWrapper>
  );
};

export default RulesList;
