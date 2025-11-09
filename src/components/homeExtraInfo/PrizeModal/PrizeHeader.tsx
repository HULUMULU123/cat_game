import styled from "styled-components";
import coin from "../../../assets/coin.png";
import HeaderCloseBtn from "../common/HeaderCloseBtn";

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

interface PrizeHeaderProps {
  handleClose: () => void;
  balance?: number;
}

export default function PrizeHeader({ handleClose, balance = 0 }: PrizeHeaderProps) {
  const formattedBalance = new Intl.NumberFormat("ru-RU").format(balance);

  return (
    <StyledHeader>
      <StyledCoinWrapper>
        <StyledCoinImg src={coin} alt="" />
        <StyledCoinCount>{formattedBalance}</StyledCoinCount>
      </StyledCoinWrapper>
      <HeaderCloseBtn handleClose={handleClose} />
    </StyledHeader>
  );
}
