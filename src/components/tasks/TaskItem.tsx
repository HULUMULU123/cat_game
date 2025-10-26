import styled from "styled-components";
import arrow from "../../assets/icons/arrow.svg";
import check from "../../assets/icons/check.svg";

const StyledListItem = styled.li<{ $done: boolean }>`
  opacity: ${({ $done }) => ($done ? "0.6" : "1")};
  display: flex;
  padding: 15px 7px;
  justify-content: space-between;
  width: 90%;
  margin: 0 auto;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.3);
  align-items: center;
  position: relative;
`;

const StyledWrapper = styled.div<{ $done: boolean }>`
  filter: ${({ $done }) => ($done ? "blur(3px)" : "none")};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  align-items: center;
`;

const StyledListItemContent = styled.div`
  display: flex;
  margin: auto;
  align-items: center;
  width: 90%;
`;

const StyledListImg = styled.img`
  width: 30px;
  margin-right: 15px;
`;

const StyledListName = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 11px;
  color: #e1fffb;
  font-weight: 700;
  width: 60%;
`;

const StyledListButton = styled.button<{ $done: boolean }>`
  width: 20%;
  padding: 10px 0;
  border: none;
  background: ${({ $done }) => ($done ? "#ffb4b4" : "#44edd1")};
  margin-left: auto;
  display: flex;
  border-radius: 7px;
  cursor: pointer;
  transition: opacity 0.15s ease-in-out, transform 0.05s ease-in-out;

  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const StyledButtonImg = styled.img`
  width: 18px;
  margin: auto;
`;

const StyledCheck = styled.img<{ $done: boolean }>`
  width: 25px;
  position: absolute;
  z-index: 5;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: ${({ $done }) => ($done ? "block" : "none")};
`;

interface TaskItemProps {
  id: number;
  name: string;
  img: string;
  url?: string;
  done: boolean;
  onOpenAndComplete: (taskId: number, done: boolean, url?: string) => void;
  disabled?: boolean;
}

const TaskItem = ({
  id,
  name,
  img,
  url,
  done,
  onOpenAndComplete,
  disabled = false,
}: TaskItemProps) => (
  <StyledListItem $done={done}>
    <StyledWrapper $done={done}>
      <StyledListItemContent>
        <StyledListImg src={img} alt="task icon" />
        <StyledListName>{name}</StyledListName>
        <StyledListButton
          type="button"
          onClick={() => onOpenAndComplete(id, done, url)}
          disabled={disabled}
          $done={done}
          aria-label="Открыть и отметить выполненным"
          title="Открыть и отметить выполненным"
        >
          <StyledButtonImg src={arrow} alt="open" />
        </StyledListButton>
      </StyledListItemContent>
    </StyledWrapper>
    <StyledCheck $done={done} src={check} alt="completed" />
  </StyledListItem>
);

export default TaskItem;
