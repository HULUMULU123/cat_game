import { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import RulesItem from "./RulesItem";

import clock from "../../../assets/rules_icons/clock.svg";
import drops from "../../../assets/rules_icons/drops.svg";
import gift from "../../../assets/rules_icons/gift.svg";
import logoCircle from "../../../assets/rules_icons/logo_circle.svg";
import logo from "../../../assets/rules_icons/logo.svg";
import money from "../../../assets/rules_icons/money.svg";
import points from "../../../assets/rules_icons/points.svg";
import rightText from "../../../assets/rules_icons/right_text.svg";
import alert from "../../../assets/rules_icons/alert.svg";

import { request } from "../../../shared/api/httpClient"; // ← FIX
import useGlobalStore from "../../../shared/store/useGlobalStore"; // ← FIX
import type { RuleCategoryResponse } from "../../../shared/api/types"; // ← FIX
import type { RuleCategory } from "../../home/types";

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
const pickIcon = (name: string): string => {
  const n = name.toLowerCase();

  if (n.includes("стакан")) return logo;
  if (n.includes("сбой") || n.includes("crash")) return drops;
  if (n.includes("условия")) return rightText;
  if (n.includes("анома")) return gift;
  if (n.includes("запрещ")) return alert;
  if (n.includes("передача") || n.includes("материаль")) return money;
  if (n.includes("таймер") || n.includes("турнир")) return clock;
  if (n.includes("допол")) return points;

  // дефолт
  return logoCircle;
};

/** Трансформируем ответ бэка к вашему типу RuleCategory */
const toRuleCategory = (r: RuleCategoryResponse): RuleCategory => ({
  id: r.id,
  text: r.category,
  rule: r.rule_text,
});

const RulesList = ({ openRuleCategory }: RulesListProps) => {
  const tokens = useGlobalStore((s) => s.tokens);
  const [rules, setRules] = useState<RuleCategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      const data = await request<RuleCategoryResponse[]>("/rules/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setRules(data);
      setErr(null);
    } catch (e) {
      console.error("[Rules] fetch error:", e);
      setErr("Не удалось загрузить правила");
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  const content = useMemo(() => {
    if (loading) return <Placeholder>Загрузка правил…</Placeholder>;
    if (err) return <Placeholder>{err}</Placeholder>;
    if (!rules.length)
      return <Placeholder>Правила пока не добавлены</Placeholder>;

    return (
      <StyledRulesList>
        {rules.map((r) => (
          <RulesItem
            key={r.id}
            icon={pickIcon(r.category)}
            text={r.category}
            handleClick={() => openRuleCategory(toRuleCategory(r))}
          />
        ))}
      </StyledRulesList>
    );
  }, [loading, err, rules, openRuleCategory]);

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
