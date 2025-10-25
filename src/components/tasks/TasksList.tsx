import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!tokens) {
      return;
    }

    let isMounted = true;

    const fetchTasks = async () => {
      try {
        const data = await request<TaskAssignmentResponse[]>("/tasks/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });
        if (isMounted) {
          setTasks(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить задания");
        }
      }
    };

    void fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [tokens]);

  const listContent = useMemo(() => {
    if (error) {
      return <Placeholder>{error}</Placeholder>;
    }

    if (!tasks.length) {
      return <Placeholder>Заданий пока нет</Placeholder>;
    }

    return tasks.map((task) => (
      <TaskItem
        key={task.task_id}
        name={task.name}
        img={task.icon || advert}
        done={task.is_completed}
      />
    ));
  }, [tasks, error]);

  return (
    <StyledContentWrapper>
      <StyledTasksList>{listContent}</StyledTasksList>
    </StyledContentWrapper>
  );
};

export default TasksList;
