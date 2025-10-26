import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { request, ApiError } from "../../shared/api/httpClient";
import type { QuizResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";

const StyledWrapper = styled.div`
  width: 95%;
  margin: 32px auto 0 auto;
`;

const StyledContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledQuestionSpan = styled.span`
  margin: 0 auto;
  font-size: 12px;
  font-weight: 700;
  font-family: "Conthrax", sans-serif;
  color: rgb(224, 255, 251);
  width: 90%;
  text-align: center;
`;

const StyledAnswersList = styled.ul`
  padding: 0;
  display: flex;
  gap: 8px;
  flex-direction: column;
  margin-top: 17px;
  align-items: center;
`;

const StyledAnwerContent = styled.div`
  width: 90%;
  display: flex;
  margin: 0 auto;
  align-items: center;
  gap: 16px;
`;

type ItemState = "idle" | "correct" | "wrongSelected";

const StyledAnswersItem = styled.li<{ $state: ItemState }>`
  width: 100%;
  display: flex;
  background: ${({ $state }) => {
    switch ($state) {
      case "correct":
        return "linear-gradient(216deg, rgba(76, 204, 181, 0.9) 0%, rgba(168, 244, 219, 0.7) 50%)";
      case "wrongSelected":
        return "linear-gradient(216deg, rgba(180, 70, 70, 0.7) 0%, rgba(200, 120, 120, 0.5) 50%)";
      default:
        return "linear-gradient(216deg, rgba(18, 99, 88, 0.7) 0%, rgba(119, 162, 148, 0.5) 50%)";
    }
  }};
  border-radius: 7px;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
`;

const StyledAnswerNumber = styled.span`
  color: #fff;
  font-size: 16px;
  font-family: "Conthrax", sans-serif;
  font-weight: 700;
  display: flex;
  width: 22px;
  justify-content: center;
`;

const StyledAnswerText = styled.span<{ $isCorrect: boolean }>`
  font-size: 11px;
  font-weight: 700;
  font-family: "Conthrax", sans-serif;
  color: ${({ $isCorrect }) => ($isCorrect ? "#0e4f45" : "rgb(135,176,168)")};
`;

const Placeholder = styled.div`
  margin-top: 24px;
  text-align: center;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: rgb(199, 247, 238);
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const NextButton = styled.button`
  border: none;
  border-radius: 7px;
  padding: 10px 18px;
  background: #44edd1;
  font-family: "Conthrax", sans-serif;
  font-size: 12px;
  color: #0e4f45;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

type Props = {
  onProgressChange?: (p: { current: number; total: number }) => void;
};

const TOTAL_QUESTIONS = 5;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const QuizPart = ({ onProgressChange }: Props) => {
  const tokens = useGlobalStore((state) => state.tokens);
  const updateBalance = useGlobalStore((s) => s.updateBalance);

  const [questions, setQuestions] = useState<QuizResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finishMsg, setFinishMsg] = useState<string | null>(null);

  // грузим вопросы
  const fetchQuestions = useCallback(async () => {
    if (!tokens) return;

    try {
      setError(null);

      // 1) пробуем получить пачку
      let data: QuizResponse[] | QuizResponse = await request<any>(
        "/quiz/?count=5",
        {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      // 2) если вернулся объект — пробуем другой путь или оборачиваем
      if (!Array.isArray(data)) {
        try {
          const alt = await request<QuizResponse[] | QuizResponse>("/quiz/", {
            headers: { Authorization: `Bearer ${tokens.access}` },
          });
          data = Array.isArray(alt) ? alt : [alt];
        } catch {
          // оставим как есть (один вопрос)
          data = [data as QuizResponse];
        }
      }

      const list = data as QuizResponse[];
      const pack =
        list.length >= TOTAL_QUESTIONS
          ? shuffle(list).slice(0, TOTAL_QUESTIONS)
          : list.slice(0, TOTAL_QUESTIONS);

      setQuestions(pack);
      setIdx(0);
      setSelected(null);
      setHasAnswered(false);
      setCorrectCount(0);
      setFinishMsg(null);
      onProgressChange?.({ current: 0, total: TOTAL_QUESTIONS });
    } catch (e) {
      console.error("[Quiz] load error:", e);
      setError("Не удалось загрузить вопросы");
    }
  }, [tokens, onProgressChange]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  const q = useMemo(() => {
    if (!questions) return null;
    return questions[idx] ?? null;
  }, [questions, idx]);

  const total = questions?.length || TOTAL_QUESTIONS;

  const handleSelect = (answerIndex: number) => {
    if (!q || hasAnswered) return;
    const isCorrect = answerIndex === q.correct_answer_index;
    setSelected(answerIndex);
    setHasAnswered(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const itemStateFor = (i: number): ItemState => {
    if (!q || !hasAnswered) return "idle";
    if (i === q.correct_answer_index) return "correct";
    if (i === selected && i !== q.correct_answer_index) return "wrongSelected";
    return "idle";
  };

  const handleNext = async () => {
    if (!questions) return;

    // последний вопрос → отправляем результат
    if (idx === questions.length - 1) {
      if (!tokens) return;
      setSubmitting(true);
      try {
        const payload = {
          mode: "quiz",
          correct: correctCount,
          total: total,
        };
        // Отправляем на твой бэк. Если у тебя другой путь — поменяй здесь.
        const resp = await request<{
          detail?: string;
          reward?: number;
          balance?: number;
        }>("/scores/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (typeof resp?.balance === "number") {
          updateBalance(resp.balance);
        }

        const msg =
          resp?.detail ??
          `Готово! Правильных: ${correctCount} из ${total}. Награда: ${
            resp?.reward ?? 0
          }`;
        setFinishMsg(msg);
      } catch (e) {
        if (e instanceof ApiError) {
          setFinishMsg(
            `Готово! Правильных: ${correctCount} из ${total}. (Ошибка отправки результата)`
          );
        } else {
          setFinishMsg(
            `Готово! Правильных: ${correctCount} из ${total}. (Ошибка сети)`
          );
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // переходим дальше
    const next = idx + 1;
    setIdx(next);
    setSelected(null);
    setHasAnswered(false);
    onProgressChange?.({ current: next, total });
  };

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        {!questions ? (
          <Placeholder>{error ?? "Готовим вопросы..."}</Placeholder>
        ) : finishMsg ? (
          <>
            <StyledQuestionSpan>{finishMsg}</StyledQuestionSpan>
            <Controls>
              <NextButton onClick={fetchQuestions} disabled={submitting}>
                Пройти ещё раз
              </NextButton>
            </Controls>
          </>
        ) : q ? (
          <>
            <StyledQuestionSpan>{q.question}</StyledQuestionSpan>

            <StyledAnswersList>
              {q.answers.map((answer, index) => (
                <StyledAnswersItem
                  key={`${index}-${answer}`}
                  $state={itemStateFor(index)}
                  onClick={() => handleSelect(index)}
                >
                  <StyledAnwerContent>
                    <StyledAnswerNumber>{index + 1}</StyledAnswerNumber>
                    <StyledAnswerText
                      $isCorrect={
                        hasAnswered && index === q.correct_answer_index
                      }
                    >
                      {answer}
                    </StyledAnswerText>
                  </StyledAnwerContent>
                </StyledAnswersItem>
              ))}
            </StyledAnswersList>

            <Controls>
              <NextButton
                onClick={handleNext}
                disabled={!hasAnswered || submitting}
              >
                {idx === total - 1 ? "Завершить" : "Далее"}
              </NextButton>
            </Controls>
          </>
        ) : (
          <Placeholder>Вопрос не найден</Placeholder>
        )}
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

export default QuizPart;
