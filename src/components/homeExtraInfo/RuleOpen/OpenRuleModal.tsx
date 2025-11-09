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
  /** объект категории: { id, text, rule } */
  ruleCategory: RuleCategory | null;
}

const safeUpper = (v: unknown) =>
  typeof v === "string" ? v.toUpperCase() : "";
const safeString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const OpenRuleModal = ({ handleClose, ruleCategory }: OpenRuleModalProps) => {
  const tokens = useGlobalStore((s) => s.tokens);

  const [ruleText, setRuleText] = useState<string | null>(
    ruleCategory && typeof ruleCategory.rule === "string"
      ? ruleCategory.rule
      : null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const categoryTitle = useMemo(() => {
    if (ruleCategory && typeof ruleCategory.text === "string") {
      return ruleCategory.text;
    }
    return "";
  }, [ruleCategory]);

  useEffect(() => {
    if (ruleCategory && typeof ruleCategory.rule === "string") {
      setRuleText(ruleCategory.rule);
    } else {
      setRuleText(null);
    }
  }, [ruleCategory]);

  useEffect(() => {
    let mounted = true;

    if (!ruleCategory) return;

    // если текст уже есть — не дёргаем бэк, чтобы не было мерцания
    if (ruleText || !tokens) return;

    const fetchRule = async () => {
      setLoading(true);
      setErr(null);
      try {
        const name = safeString(ruleCategory?.text);

        // 1) если бэк поддерживает фильтр по категории
        let list: RuleCategoryResponse[];
        if (name) {
          list = await request<RuleCategoryResponse[]>(
            `/rules/?category=${encodeURIComponent(name)}`,
            { headers: { Authorization: `Bearer ${tokens.access}` } }
          );
        } else {
          // 2) иначе — забираем весь список и сами ищем
          list = await request<RuleCategoryResponse[]>(`/rules/`, {
            headers: { Authorization: `Bearer ${tokens.access}` },
          });
        }

        let found: RuleCategoryResponse | undefined;

        // пробуем матчить по id
        if (typeof ruleCategory?.id === "number") {
          const id = ruleCategory.id;
          found = list.find((r) => r.id === id);
        }

        // если не нашли — матчим по названию категории case-insensitive
        if (!found && name) {
          const n = name.toLowerCase();
          found = list.find((r) => r.category.trim().toLowerCase() === n);
        }

        if (mounted && found?.rule_text) {
          setRuleText(found.rule_text);
        } else if (mounted && !ruleCategory?.rule) {
          // если так и не нашли и не было стартового текста
          setErr("Правило пока недоступно");
        }
      } catch (e) {
        // Ошибка запроса: показываем ошибку только если нет стартового текста
        if (mounted && !ruleCategory?.rule) {
          setErr("Не удалось загрузить правило");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchRule();
    return () => {
      mounted = false;
    };
  }, [tokens, ruleCategory, ruleText]);

  return (
    <StyledWrapper>
      <RulesHeader handleClose={handleClose} />
      <ModalName textName={safeUpper(categoryTitle)} />

      {!ruleCategory ? (
        <Placeholder>Категория правил не выбрана</Placeholder>
      ) : ruleText ? (
        <RulesContent plainText={ruleText} />
      ) : loading ? (
        <Placeholder>Загрузка правил…</Placeholder>
      ) : err ? (
        <Placeholder>{err}</Placeholder>
      ) : (
        <Placeholder>Правило скоро появится</Placeholder>
      )}

      <DarkLayoutIcon />
    </StyledWrapper>
  );
};

export default OpenRuleModal;
