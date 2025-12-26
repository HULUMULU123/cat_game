import { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import TaskItem from "./TaskItem";
import advert from "../../assets/icons/advert.svg";
import { request } from "../../shared/api/httpClient";
import { resolveMediaUrl } from "../../shared/api/urls";
import type { TaskAssignmentResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";
import { useQuery, useQueryClient } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

const StyledContentWrapper = styled.div`
  margin: 0 auto;
  width: 95%;
  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: content-box;
  scrollbar-width: thin;
  scrollbar-color: #e1fffb #2cc2a9;
  height: 65vh;

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

const StyledTasksList = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Placeholder = styled.div`
  margin: 40px auto 0;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: #c7f7ee;
`;

/* ----------------- helpers ----------------- */
const normalizeUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // добавим протокол, если его нет
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const finalUrl = hasProtocol ? trimmed : `https://${trimmed}`;

  try {
    // валидация URL (кинет исключение, если невалидный)
    // eslint-disable-next-line no-new
    new URL(finalUrl);
    return finalUrl;
  } catch (e) {
    console.warn("[Tasks] URL is invalid after normalization:", {
      url,
      finalUrl,
      e,
    });
    return undefined;
  }
};

/**
 * Пытается открыть ссылку в новой вкладке.
 * Возвращает способ открытия:
 *  - "win"  — через window.open
 *  - "a"    — через программный клик по <a>
 *  - "none" — ничто не сработало (маловероятно)
 */
const openInNewTabSafe = (href: string): "win" | "a" | "none" => {
  try {
    console.log("[Tasks] try window.open:", href);
    const win = window.open(href, "_blank", "noopener,noreferrer");
    if (win && !win.closed) {
      console.log("[Tasks] window.open success");
      return "win";
    }
  } catch (e) {
    console.warn("[Tasks] window.open threw:", e);
  }

  try {
    console.warn("[Tasks] window.open blocked → fallback <a>.click()");
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return "a";
  } catch (e) {
    console.error("[Tasks] <a>.click() fallback failed:", e);
  }

  return "none";
};
/* ------------------------------------------- */

const TasksList = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<TaskAssignmentResponse[]>({
    queryKey: ["tasks", tokens?.access ?? null],
    enabled: Boolean(tokens),
    queryFn: async () => {
      if (!tokens) return [];
      console.log("[Tasks] GET /tasks/");
      return request<TaskAssignmentResponse[]>("/tasks/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
    },
  });

  useEffect(() => {
    if (isError && error) {
      console.error("[Tasks] fetch error:", error);
    }
  }, [error, isError]);

  const markTaskCompleted = useCallback(
    async (taskId: number) => {
      if (!tokens) {
        console.warn("[Tasks] no tokens, cannot toggle completion");
        return;
      }

      try {
        setPendingIds((prev) => {
          const s = new Set(prev);
          s.add(taskId);
          return s;
        });

        console.log("[Tasks] POST /tasks/toggle/", { taskId });
        const resp = await request<{
          is_completed: boolean;
          balance: number;
          pending_check?: boolean;
        }>("/tasks/toggle/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task_id: taskId, is_completed: true }),
        });
        console.log("[Tasks] toggle resp:", resp);

        queryClient.setQueryData<TaskAssignmentResponse[] | undefined>(
          ["tasks", tokens?.access ?? null],
          (prev) =>
            (prev ?? []).map((t) =>
              t.task_id === taskId
                ? { ...t, is_completed: resp.is_completed }
                : t
            )
        );
      } catch (e) {
        console.error("[Tasks] toggle error:", e);
      } finally {
        setPendingIds((prev) => {
          const copy = new Set(prev);
          copy.delete(taskId);
          return copy;
        });
      }
    },
    [queryClient, tokens]
  );

  // открыть ссылку и отметить выполненным (с телеграм-подпиской — после проверки)
  const handleOpenAndComplete = useCallback(
    async (taskId: number, done: boolean, rawUrl?: string | null) => {
      console.log("[Tasks] click task:", { taskId, done, rawUrl });

      const url = normalizeUrl(rawUrl);
      if (url) {
        const method = openInNewTabSafe(url);
        console.log("[Tasks] open method:", method);

        // если вы в iframe/webview и попапы заблокированы — последний шанс:
        if (method === "none") {
          try {
            console.warn("[Tasks] final fallback → location.assign");
            window.location.assign(url);
          } catch (e) {
            console.error("[Tasks] location.assign failed:", e);
          }
        }
      } else {
        console.warn("[Tasks] link is empty/invalid, not opening a tab", {
          rawUrl,
        });
      }

      if (done) {
        console.log("[Tasks] already completed → skip toggle");
        return;
      }

      await markTaskCompleted(taskId);
    },
    [markTaskCompleted]
  );

  const listContent = useMemo(() => {
    if (!tokens)
      return <Placeholder>Авторизуйтесь, чтобы увидеть задания</Placeholder>;
    if (isLoading)
      return (
        <Placeholder>
          <LoadingSpinner label="Загружаем задания" />
        </Placeholder>
      );
    if (isError)
      return <Placeholder>Не удалось загрузить задания</Placeholder>;
    if (!tasks.length) return <Placeholder>Заданий пока нет</Placeholder>;

    return tasks.map((task) => (
      <TaskItem
        key={task.task_id}
        id={task.task_id}
        name={task.name}
        img={resolveMediaUrl(task.icon) || advert}
        url={task.link || undefined}
        done={task.is_completed}
        reward={task.reward}
        onOpenAndComplete={handleOpenAndComplete}
        disabled={pendingIds.has(task.task_id)}
      />
    ));
  }, [tasks, isError, isLoading, pendingIds, handleOpenAndComplete, tokens]);

  return (
    <StyledContentWrapper>
      <StyledTasksList>{listContent}</StyledTasksList>
    </StyledContentWrapper>
  );
};

export default TasksList;
