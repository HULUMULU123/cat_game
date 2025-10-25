import { useEffect, useMemo } from "react";
import styled from "styled-components";
import coin from "../../assets/coin.png";
import history from "../../assets/icons/history.svg";
import useGlobalStore from "../../shared/store/useGlobalStore";

const StyledContentWrapper = styled.div`
  display: flex;
  width: 90%;
  padding: 15px 20px;
  justify-content: space-between;
`;

const StyledCoinWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StyledCoinCount = styled.span`
  font-size: 16px;
  font-family: "Conthrax", sans-serif;
  color: #e1fffb;
  font-weight: 700;
`;

const StyledCoinImg = styled.img`
  width: 30px;
  height: 30px;
`;

const StyledHistoryBtn = styled.button`
  border: none;
  background: transparent;
  width: 35px;
  height: 35px;
`;

const StyledHistoryImg = styled.img`
  width: 100%;
  height: 100%;
`;

interface CoinCountProps {
  isPrize?: boolean;
  setIsModalOpen?: (value: boolean) => void;
}

const CoinCount = ({ isPrize = false, setIsModalOpen }: CoinCountProps) => {
  const balance = useGlobalStore((state) => state.balance);
  const tokens = useGlobalStore((state) => state.tokens);
  const loadProfile = useGlobalStore((state) => state.loadProfile);

  useEffect(() => {
    if (tokens) {
      void loadProfile();
    }
  }, [tokens, loadProfile]);

  const formattedBalance = useMemo(
    () => balance.toLocaleString("ru-RU"),
    [balance],
  );

  return (
    <StyledContentWrapper>
      <StyledCoinWrapper>
        <StyledCoinImg src={coin} />
        <StyledCoinCount>{formattedBalance}</StyledCoinCount>
      </StyledCoinWrapper>

      {isPrize && setIsModalOpen ? (
        <StyledHistoryBtn onClick={() => setIsModalOpen(true)}>
          <StyledHistoryImg src={history} />
        </StyledHistoryBtn>
      ) : null}
    </StyledContentWrapper>
  );
};

export default CoinCount;
