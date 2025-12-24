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

const Message = styled.p`
  color: #fff;
  font-size: 18px;
  line-height: 1.5;
  max-width: 520px;
  margin: 0;
`;

const TelegramOnlyScreen = () => (
  <Screen>
    <Message>
      Чтобы открыть игру, войдите через официальный бот STAKAN в Telegram.
    </Message>
  </Screen>
);

export default TelegramOnlyScreen;
