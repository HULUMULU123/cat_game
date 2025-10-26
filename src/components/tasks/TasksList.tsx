import { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import TaskItem from "./TaskItem";
import advert from "../../assets/icons/advert.svg";
import { request } from "../../shared/api/httpClient";
import type { TaskAssignmentResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

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

const TasksList = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const [tasks, setTasks] = useState<TaskAssignmentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const fetchTasks = useCallback(async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      const data = await request<TaskAssignmentResponse[]>("/tasks/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setTasks(data);
      setError(null);
    } catch {
      setError("Не удалось загрузить задания");
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // открыть ссылку и отметить выполненным (требование)
  const handleOpenAndComplete = async (
    taskId: number,
    done: boolean,
    url?: string | null
  ) => {
    if (!tokens) return;

    // Открываем ссылку в новой вкладке (если есть)
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    // Если уже выполнено — можем ничего не делать, либо принудительно подтверждать
    if (done) return;

    try {
      setPendingIds((prev) => new Set(prev).add(taskId));
      const resp = await request<{ is_completed: boolean; balance: number }>(
        "/tasks/toggle/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task_id: taskId, is_completed: true }), // ← всегда ставим как выполнено
        }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === taskId ? { ...t, is_completed: resp.is_completed } : t
        )
      );
    } catch (e) {
      console.error("Ошибка при отметке задания:", e);
    } finally {
      setPendingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(taskId);
        return copy;
      });
    }
  };

  const listContent = useMemo(() => {
    if (error) return <Placeholder>{error}</Placeholder>;
    if (loading) return <Placeholder>Загрузка заданий...</Placeholder>;
    if (!tasks.length) return <Placeholder>Заданий пока нет</Placeholder>;

    return tasks.map((task) => (
      <TaskItem
        key={task.task_id}
        id={task.task_id}
        name={task.name}
        img={task.icon || advert}
        url={task.link || undefined}
        done={task.is_completed}
        onOpenAndComplete={handleOpenAndComplete}
        disabled={pendingIds.has(task.task_id)}
      />
    ));
  }, [tasks, error, loading, pendingIds]);

  return (
    <StyledContentWrapper>
      <StyledTasksList>{listContent}</StyledTasksList>
    </StyledContentWrapper>
  );
};

export default TasksList;
