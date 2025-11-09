import { useEffect, useState } from "react";
import styled from "styled-components";
import PrizeModal from "./PrizeModal/PrizeModal";
import RewardModal from "./DailyReward/Rewards/RewardModal";
import RulesModal from "./Rules/RulesModal";
import OpenRuleModal from "./RuleOpen/OpenRuleModal";
import UserInfo from "./UserInfo/UserInfo";
import useGlobalStore from "../../shared/store/useGlobalStore";

import type { HomeModalType, RuleCategory } from "../home/types";

const StyledModalLayout = styled.div<{ $isVisible: boolean }>`
  top: 0;
  left: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1000000;

  backdrop-filter: ${({ $isVisible }) =>
    $isVisible ? "blur(20px)" : "blur(0px)"};

  background: ${({ $isVisible }) =>
    $isVisible ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0)"};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transition: backdrop-filter 0.4s ease, background 0.4s ease;
`;

const ModalContent = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

interface HomeModalProps {
  infoType: HomeModalType;
  isOpen: boolean;
  handleClose: () => void;
  handleRuleClose: () => void;
  ruleCategory: RuleCategory | null;
  openRuleCategory: (category: RuleCategory) => void;
}

const HomeModal = ({
  infoType,
  isOpen,
  handleClose,
  handleRuleClose,
  ruleCategory,
  openRuleCategory,
}: HomeModalProps) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const setBottomNavVisible = useGlobalStore((state) => state.setBottomNavVisible);

  useEffect(() => {
    if (!isOpen) {
      setIsAnimated(false);
      return;
    }
    const timer = window.setTimeout(() => setIsAnimated(true), 50);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    setBottomNavVisible(false);
    return () => setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  const renderContent = () => {
    switch (infoType) {
      case "prize":
        return <PrizeModal handleClose={handleClose} />;

      case "reward":
        return <RewardModal handleClose={handleClose} />;

      case "rules":
        return (
          <RulesModal
            handleClose={handleClose}
            openRuleCategory={openRuleCategory}
          />
        );

      case "rule_category":
        return (
          <OpenRuleModal
            handleClose={handleRuleClose}
            ruleCategory={ruleCategory}
          />
        );

      case "user":
        return <UserInfo handleClose={handleClose} />;

      default:
        return null;
    }
  };

  return (
    <StyledModalLayout
      $isVisible={isAnimated}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <ModalContent onClick={(event) => event.stopPropagation()}>
        {renderContent()}
      </ModalContent>
    </StyledModalLayout>
  );
};

export default HomeModal;
