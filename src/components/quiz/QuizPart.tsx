import { useEffect, useState } from "react";
import styled from "styled-components";
import { request } from "../../shared/api/httpClient";
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
  width: 70%;
  text-align: center;
`;

const StyledAnswersList = styled.ul`
  padding: 0;
  display: flex;
  gap: 5px;
  flex-direction: column;
  margin-top: 17px;
  align-items: center;
`;

const StyledAnwerContent = styled.div`
  width: 80%;
  display: flex;
  margin: 0 auto;
  align-items: center;
  gap: 20px;
`;

const StyledAnswersItem = styled.li<{ $isCorrect: boolean }>`
  width: 95%;
  display: flex;
  background: ${({ $isCorrect }) =>
    $isCorrect
      ? "linear-gradient(216deg, rgba(76, 204, 181, 0.9) 0%, rgba(168, 244, 219, 0.7) 50%)"
      : "linear-gradient(216deg, rgba(18, 99, 88, 0.7) 0%, rgba(119, 162, 148, 0.5) 50%)"};
  border-radius: 7px;
  padding: 7px 0;
`;

const StyledAnswerNumber = styled.span`
  color: #fff;
  font-size: 20px;
  font-family: "Conthrax", sans-serif;
  font-weight: 700;
  display: flex;
  width: 20px;
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

const QuizPart = () => {
  const tokens = useGlobalStore((state) => state.tokens);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) {
      return;
    }

    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const data = await request<QuizResponse>("/quiz/", {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        });
        if (isMounted) {
          setQuiz(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить вопрос викторины");
        }
      }
    };

    void fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [tokens]);

  return (
    <StyledWrapper>
      <StyledContentWrapper>
        <StyledQuestionSpan>
          {quiz ? quiz.question : "Подготовка вопроса..."}
        </StyledQuestionSpan>
        <StyledAnswersList>
          {quiz ? (
            quiz.answers.map((answer, index) => {
              const isCorrect = index === quiz.correct_answer_index;
              return (
                <StyledAnswersItem
                  key={`${index}-${answer}`}
                  $isCorrect={isCorrect}
                >
                  <StyledAnwerContent>
                    <StyledAnswerNumber>{index + 1}</StyledAnswerNumber>
                    <StyledAnswerText $isCorrect={isCorrect}>
                      {answer}
                    </StyledAnswerText>
                  </StyledAnwerContent>
                </StyledAnswersItem>
              );
            })
          ) : (
            <Placeholder>{error ?? "Загружаем ответы..."}</Placeholder>
          )}
        </StyledAnswersList>
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

export default QuizPart;
