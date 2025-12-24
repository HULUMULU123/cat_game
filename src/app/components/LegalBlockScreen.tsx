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

const LegalBlockScreen = () => (
  <Screen>
    <Message>
      Для того, чтобы открыть игру, нужно ознакомиться с правилами.
    </Message>
  </Screen>
);

export default LegalBlockScreen;
