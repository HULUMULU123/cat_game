import styled from "styled-components";

const Screen = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 520px;
`;

const Message = styled.p`
  color: #fff;
  font-size: 18px;
  line-height: 1.5;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

const TelegramButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  min-width: 220px;
  border-radius: 12px;
  background: #229ed9;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(34, 158, 217, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(34, 158, 217, 0.45);
  }

  &:active {
    transform: translateY(0);
    opacity: 0.9;
  }
`;

const TelegramOnlyScreen = () => (
  <Screen>
    <Content>
      <Message>
        Чтобы открыть игру, войдите через официальный бот STAKAN в Telegram.
      </Message>
      <ButtonRow>
        <TelegramButton
          href="https://t.me/stakanonline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Перейти в канал
        </TelegramButton>
        <TelegramButton
          href="https://t.me/stakanonlinebot"
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть бота
        </TelegramButton>
      </ButtonRow>
    </Content>
  </Screen>
);

export default TelegramOnlyScreen;
