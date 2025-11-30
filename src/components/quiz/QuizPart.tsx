import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { request, ApiError } from "../../shared/api/httpClient";
import type { QuizResponse } from "../../shared/api/types";
import useGlobalStore from "../../shared/store/useGlobalStore";
import ModalLayout from "../modalWindow/ModalLayout";
import ModalWindow from "../modalWindow/ModalWindow";
import black_advert from "../../assets/icons/black_advert.svg";
import useAdsgramAd, { AdsgramStatus } from "../../shared/hooks/useAdsgramAd";
import useAdsgramBlock from "../../shared/hooks/useAdsgramBlock";
import { useQuery } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { useAdsgram } from "@adsgram/react";

const StyledWrapper = styled.div`
  width: 95%;
  margin: 24px auto 0 auto;
`;

const StyledContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledQuestionSpan = styled.span`
  margin: 0 auto;
  font-size: 20px;
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
  margin-top: 12px;
  align-items: center;
  width: 100%;
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
  width: 95%;
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
  cursor: ${({ $state }) => ($state === "idle" ? "pointer" : "default")};
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
  font-size: 14px;
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

const ModalBtnContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ModalBtnContentImg = styled.img`
  width: 20px;
  height: 20px;
`;

const ModalBtnContentText = styled.span`
  font-family: "Conthrax", sans-serif;
  font-size: 8px;
  color: var(--color-main);
  text-transform: uppercase;
`;

type Props = {
  onProgressChange?: (p: { current: number; total: number }) => void;
  onTimerChange?: (t: { remaining: number; total: number }) => void; // <-- пробрасываем во внешний визуальный таймер
};

const TOTAL_QUESTIONS = 5;
const QUESTION_TIME_SEC = 20;

const btnLabelByStatus = (status: AdsgramStatus): string => {
  switch (status) {
    case "awaiting":
      return "Инициализация";
    case "confirming":
      return "Подтверждение";
    case "completed":
      return "Просмотрено";
    case "requesting":
      return "Запрос";
    default:
      return "Смотреть рекламу";
  }
};

const ModalBtnContent = ({ status }: { status: AdsgramStatus }) => (
  <ModalBtnContentWrapper>
    <ModalBtnContentImg src={black_advert} alt="advert" />
    <ModalBtnContentText>{btnLabelByStatus(status)}</ModalBtnContentText>
  </ModalBtnContentWrapper>
);

type AnswerLogEntry = {
  questionId: number;
  selectedAnswer: string;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function QuizPart({ onProgressChange, onTimerChange }: Props) {
  const tokens = useGlobalStore((state) => state.tokens);
  const {
    startAdFlow,
    isLoading: isAdLoading,
    status: adsStatus,
    error: adsError,
    reset: resetAds,
  } = useAdsgramAd();

  const {
    data: adsgramBlock,
    isError: isAdsBlockError,
    error: adsBlockError,
  } = useAdsgramBlock();

  const { show } = useAdsgram({
    blockId: adsgramBlock?.block_id,
    onReward: () => {},
    onError: () => {},
  });

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finishMsg, setFinishMsg] = useState<string | null>(null);
  const [answerLog, setAnswerLog] = useState<AnswerLogEntry[]>([]);

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adMessage, setAdMessage] = useState("");
  const [adOutcome, setAdOutcome] = useState<"pending" | "success">("pending");
  const [adReason, setAdReason] = useState<"wrong" | "timeout">("wrong");
  const [adSkipsUsed, setAdSkipsUsed] = useState(0);

  const [remaining, setRemaining] = useState<number>(QUESTION_TIME_SEC);
  const timerRef = useRef<number | null>(null);

  // ===== Загрузка 5 вопросов =====
  const {
    data: fetchedQuestions,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErrorRaw,
    refetch: refetchQuestions,
    isFetching: isFetchingQuestions,
  } = useQuery<QuizResponse[]>({
    queryKey: ["quiz-questions", tokens?.access ?? null],
    enabled: Boolean(tokens),
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!tokens) return [];
      let data: QuizResponse[] | QuizResponse = await request<any>(
        "/quiz/random/",
        {
          headers: { Authorization: `Bearer ${tokens.access}` },
        }
      );

      if (!Array.isArray(data)) {
        const calls = Array.from({ length: TOTAL_QUESTIONS }).map(() =>
          request<QuizResponse>("/quiz/", {
            headers: { Authorization: `Bearer ${tokens.access}` },
          })
        );
        data = await Promise.all(calls);
      }

      const list = data as QuizResponse[];
      if (list.length === 0) return [];
      if (list.length >= TOTAL_QUESTIONS) {
        return shuffle(list).slice(0, TOTAL_QUESTIONS);
      }
      return list.slice(0, TOTAL_QUESTIONS);
    },
  });

  useEffect(() => {
    if (!fetchedQuestions || fetchedQuestions.length === 0) {
      return;
    }
    setAnswerLog([]);
    setIdx(0);
    setSelected(null);
    setHasAnswered(false);
    setCorrectCount(0);
    setFinishMsg(null);
    setAdModalOpen(false);
    setAdMessage("");
    setAdOutcome("pending");
    setAdReason("wrong");
    setAdSkipsUsed(0);
    resetAds();
    setRemaining(QUESTION_TIME_SEC);
    onProgressChange?.({ current: 0, total: fetchedQuestions.length });
    onTimerChange?.({
      remaining: QUESTION_TIME_SEC,
      total: QUESTION_TIME_SEC,
    });
  }, [fetchedQuestions, onProgressChange, onTimerChange, resetAds]);

  const questions = fetchedQuestions ?? null;

  useEffect(() => {
    if (questionsError && questionsErrorRaw) {
      console.error("[Quiz] load error:", questionsErrorRaw);
    }
  }, [questionsError, questionsErrorRaw]);

  useEffect(() => {
    if (isAdsBlockError && adsBlockError) {
      console.error("Failed to fetch Adsgram block id", adsBlockError);
    }
  }, [adsBlockError, isAdsBlockError]);

  const isLoadingQuestions = questionsLoading || isFetchingQuestions;

  const errorMessage = useMemo(() => {
    if (!tokens) return "Авторизуйтесь, чтобы пройти викторину";
    if (questionsError) return "Не удалось загрузить вопросы";
    return null;
  }, [questionsError, tokens]);

  const q = useMemo(() => {
    if (!questions) return null;
    return questions[idx] ?? null;
  }, [questions, idx]);

  const total = questions?.length || TOTAL_QUESTIONS;

  const recordAnswer = useCallback(
    (question: QuizResponse, answer: string) => {
      setAnswerLog((prev) => {
        const next = prev.slice();
        next[idx] = { questionId: question.id, selectedAnswer: answer };
        return next;
      });
    },
    [idx]
  );

  const handleSecondFailure = useCallback(
    (reason: "wrong" | "timeout") => {
      setAdModalOpen(false);
      setAdMessage("");
      setAdOutcome("pending");
      setAdReason(reason);
      resetAds();
      setFinishMsg("Викторина сброшена. Попробуйте снова.");
      setRemaining(0);
      setSubmitting(false);
      onTimerChange?.({ remaining: 0, total: QUESTION_TIME_SEC });
    },
    [onTimerChange, resetAds]
  );

  // ===== Таймер логики (не UI) =====
  useEffect(() => {
    if (!q) return;

    if (hasAnswered) return;

    setRemaining(QUESTION_TIME_SEC);
    onTimerChange?.({ remaining: QUESTION_TIME_SEC, total: QUESTION_TIME_SEC });

    if (timerRef.current) window.clearInterval(timerRef.current);

    const id = window.setInterval(() => {
      setRemaining((s) => {
        const next = s - 1;
        const clamped = next <= 0 ? 0 : next;
        onTimerChange?.({ remaining: clamped, total: QUESTION_TIME_SEC });

        if (clamped === 0) {
          window.clearInterval(id);
          timerRef.current = null;
          setHasAnswered(true);
          recordAnswer(q, "");
          setSelected(null);
          if (adSkipsUsed >= 1) {
            handleSecondFailure("timeout");
          } else {
            setAdReason("timeout");
            setAdOutcome("pending");
            setAdMessage(
              "Время вышло. Посмотрите рекламу, чтобы продолжить викторину."
            );
            setAdModalOpen(true);
          }
        }
        return clamped;
      });
    }, 1000);
    timerRef.current = id;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [
    q,
    hasAnswered,
    onTimerChange,
    recordAnswer,
    adSkipsUsed,
    handleSecondFailure,
  ]);

  // ===== Выбор ответа =====
  const handleSelect = (answerIndex: number) => {
    if (!q || hasAnswered) return;
    const isCorrect = answerIndex === q.correct_answer_index;
    setSelected(answerIndex);
    setHasAnswered(true);
    const answerText = q.answers[answerIndex] ?? "";
    recordAnswer(q, answerText);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      return;
    }

    if (adSkipsUsed >= 1) {
      handleSecondFailure("wrong");
      return;
    }

    setAdReason("wrong");
    setAdOutcome("pending");
    setAdMessage(
      "Неправильный ответ. Посмотрите рекламу, чтобы продолжить викторину."
    );
    setAdModalOpen(true);
  };

  const itemStateFor = (i: number): ItemState => {
    if (!q || !hasAnswered) return "idle";
    if (i === q.correct_answer_index) return "correct";
    if (i === selected && i !== q.correct_answer_index) return "wrongSelected";
    return "idle";
  };

  // ===== Следующий вопрос / Завершение =====
  const finishQuiz = useCallback(
    async (answers: AnswerLogEntry[]) => {
      if (!tokens) {
        setFinishMsg("Викторина завершена.");
        return;
      }

      const sanitized = answers.filter((entry): entry is AnswerLogEntry =>
        Boolean(entry)
      );

      if (sanitized.length === 0) {
        setFinishMsg("Викторина завершена.");
        onTimerChange?.({ remaining: 0, total: QUESTION_TIME_SEC });
        return;
      }

      setSubmitting(true);
      setAdModalOpen(false);
      resetAds();
      try {
        const payload = {
          mode: "quiz",
          answers: sanitized.map((entry) => ({
            question_id: entry.questionId,
            selected_answer: entry.selectedAnswer,
          })),
        };

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
          useGlobalStore.getState().updateBalance(resp.balance);
        }

        useGlobalStore.getState().incrementProfileStat("quizzes");

        const msg =
          resp?.detail ??
          `Готово! Правильных: ${correctCount} из ${
            sanitized.length
          }. Награда: ${resp?.reward ?? 0}`;
        setFinishMsg(msg);
      } catch (e) {
        if (e instanceof ApiError) {
          setFinishMsg(
            `Готово! Правильных: ${correctCount} из ${sanitized.length}. (Ошибка отправки результата)`
          );
        } else {
          setFinishMsg(
            `Готово! Правильных: ${correctCount} из ${sanitized.length}. (Ошибка сети)`
          );
        }
      } finally {
        setSubmitting(false);
        onTimerChange?.({ remaining: 0, total: QUESTION_TIME_SEC });
      }
    },
    [correctCount, onTimerChange, resetAds, tokens]
  );

  const handleNext = async () => {
    if (!questions) return;

    const answersSoFar = answerLog.filter((entry): entry is AnswerLogEntry =>
      Boolean(entry)
    );

    if (idx === questions.length - 1) {
      await finishQuiz(answersSoFar);
      return;
    }

    const next = idx + 1;
    setIdx(next);
    setSelected(null);
    setHasAnswered(false);
    setRemaining(QUESTION_TIME_SEC);
    onProgressChange?.({ current: next, total });
    onTimerChange?.({ remaining: QUESTION_TIME_SEC, total: QUESTION_TIME_SEC });
  };

  const handleAdModalToggle = (value: boolean) => {
    if (value) {
      setAdOutcome("pending");
      return;
    }

    setAdModalOpen(false);
    resetAds();

    if (adOutcome !== "success") {
      const answersSoFar = answerLog.filter((entry): entry is AnswerLogEntry =>
        Boolean(entry)
      );
      void finishQuiz(answersSoFar);
    }
  };

  const handleWatchAd = async () => {
    try {
      await show();
      setAdOutcome("success");
      setAdModalOpen(false);
      setAdMessage("");
      resetAds();
      setAdSkipsUsed((count) => count + 1);
      await handleNext();
    } catch (error) {
      setAdOutcome("pending");
      if (error instanceof Error) {
        setAdMessage(error.message);
      } else {
        setAdMessage("Не удалось воспроизвести рекламу.");
      }
    }
  };

  useEffect(() => {
    if (!adModalOpen) return;

    if (adsStatus === "awaiting") {
      setAdMessage("Запускаем рекламный показ Adsgram…");
    } else if (adsStatus === "confirming") {
      setAdMessage("Подтверждаем выполнение задания Adsgram…");
    }
  }, [adsStatus, adModalOpen]);

  useEffect(() => {
    if (!adModalOpen || !adsError) return;
    setAdMessage(adsError);
  }, [adsError, adModalOpen]);

  // ===== Рендер =====
  return (
    <StyledWrapper>
      <StyledContentWrapper>
        {isLoadingQuestions ? (
          <Placeholder>
            <LoadingSpinner label="Готовим вопросы..." />
          </Placeholder>
        ) : errorMessage ? (
          <Placeholder>{errorMessage}</Placeholder>
        ) : !questions || questions.length === 0 ? (
          <Placeholder>Вопросы скоро появятся</Placeholder>
        ) : finishMsg ? (
          <>
            <StyledQuestionSpan>{finishMsg}</StyledQuestionSpan>
            <Controls>
              <NextButton
                onClick={() => {
                  if (!tokens) return;
                  void refetchQuestions();
                }}
                disabled={submitting}
              >
                Пройти ещё раз
              </NextButton>
            </Controls>
          </>
        ) : q ? (
          <>
            <StyledQuestionSpan>
              {q.question_text || "Вопрос"}
            </StyledQuestionSpan>

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
                disabled={!hasAnswered || submitting || adModalOpen}
              >
                {idx === total - 1 ? "Завершить" : "Далее"}
              </NextButton>
            </Controls>
          </>
        ) : (
          <Placeholder>Вопрос не найден</Placeholder>
        )}
      </StyledContentWrapper>
      {adModalOpen ? (
        <ModalLayout isOpen={adModalOpen} setIsOpen={handleAdModalToggle}>
          <ModalWindow
            header={
              adReason === "timeout" ? "ВРЕМЯ ИСТЕКЛО" : "НЕПРАВИЛЬНЫЙ ОТВЕТ"
            }
            text={adMessage}
            btnContent={<ModalBtnContent status={adsStatus} />}
            setOpenModal={handleAdModalToggle}
            isOpenModal={adModalOpen}
            onAction={handleWatchAd}
            isActionLoading={isAdLoading}
          />
        </ModalLayout>
      ) : null}
    </StyledWrapper>
  );
}
