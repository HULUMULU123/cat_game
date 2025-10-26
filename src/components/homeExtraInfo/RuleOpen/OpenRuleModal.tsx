import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import RulesHeader from "./RulesHeader";
import ModalName from "../common/ModalName";
import RulesContent from "./RulesContent";
import type { RuleCategory } from "../../home/types";
import DarkLayoutIcon from "./DarkLayoutIcon";

import { request } from "../../../shared/api/httpClient";
import useGlobalStore from "../../../shared/store/useGlobalStore";
import type { RuleCategoryResponse } from "../../../shared/api/types";

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
  /** объект категории из бэка: { id, text, rule } */
  ruleCategory: RuleCategory;
}

const safeUpper = (v: unknown) =>
  typeof v === "string" ? v.toUpperCase() : "";

const safeString = (v: unknown) => (typeof v === "string" ? v : "");

/**
 * Загрузка одной категории правил:
 * - сначала пытаемся по id: GET /rules/{id}/
 * - если id нет, пробуем GET /rules/?category=<name> и берём первый результат
 */
async function fetchRuleText(
  tokens: { access: string },
  ruleCategory: RuleCategory
): Promise<string | null> {
  // 1) если есть id — читаем детально
  if (typeof (ruleCategory as any)?.id === "number") {
    const id = (ruleCategory as any).id as number;
    const detail = await request<RuleCategoryResponse>(`/rules/${id}/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });
    return detail.rule_text ?? null;
  }

  // 2) иначе — ищем по названию категории
  const name = safeString((ruleCategory as any)?.text);
  if (name) {
    const list = await request<RuleCategoryResponse[]>(
      `/rules/?category=${encodeURIComponent(name)}`,
      {
        headers: { Authorization: `Bearer ${tokens.access}` },
      }
    );
    if (Array.isArray(list) && list.length > 0) {
      return list[0].rule_text ?? null;
    }
  }

  // 3) фолбэк: если в объекте уже есть rule — вернём его
  const inlineRule = safeString((ruleCategory as any)?.rule);
  return inlineRule || null;
}

const OpenRuleModal = ({ handleClose, ruleCategory }: OpenRuleModalProps) => {
  const tokens = useGlobalStore((s) => s.tokens);

  const [ruleText, setRuleText] = useState<string | null>(
    // мгновенный фолбэк: покажем то, что уже прилетело в объекте
    typeof (ruleCategory as any)?.rule === "string"
      ? ((ruleCategory as any).rule as string)
      : null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const categoryTitle = useMemo(() => {
    const t =
      typeof (ruleCategory as any)?.text === "string"
        ? (ruleCategory as any).text
        : typeof ruleCategory === "string"
        ? (ruleCategory as string)
        : "";
    return t;
  }, [ruleCategory]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tokens) return;
      setLoading(true);
      setErr(null);
      try {
        const text = await fetchRuleText(tokens, ruleCategory);
        if (mounted) {
          setRuleText(text ?? null);
        }
      } catch (e) {
        if (mounted) {
          console.error("[Rules] fetch rule failed:", e);
          setErr("Не удалось загрузить правило");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tokens, ruleCategory]);

  return (
    <StyledWrapper>
      <RulesHeader handleClose={handleClose} />
      <ModalName textName={safeUpper(categoryTitle)} />

      {loading ? (
        <Placeholder>Загрузка правил…</Placeholder>
      ) : err ? (
        <Placeholder>{err}</Placeholder>
      ) : ruleText ? (
        // Рендерим плоский текст правила, пришедший с бэка
        <RulesContent plainText={ruleText} />
      ) : (
        <Placeholder>Правило скоро появится</Placeholder>
      )}

      <DarkLayoutIcon />
    </StyledWrapper>
  );
};

export default OpenRuleModal;
