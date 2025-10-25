import { useCallback, useState } from "react";
import Header from "../components/home/Header";
import Model from "../components/home/Model";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";
import MainAction from "../components/home/MainAction";
import HomeModal from "../components/homeExtraInfo/HomeModal";
import { HomeModalType, RuleCategory } from "../components/home/types";
import usePageReady from "../shared/hooks/usePageReady";

const Home = () => {
  usePageReady();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoType, setInfoType] = useState<HomeModalType>("");
  const [ruleCategory, setRuleCategory] = useState<RuleCategory>("");

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setInfoType("");
  }, []);

  const openRuleCategory = useCallback((category: RuleCategory) => {
    setRuleCategory(category);
    setInfoType("rule_category");
  }, []);

  const handleRuleCategoryClose = useCallback(() => {
    setRuleCategory("");
    setInfoType("rules");
  }, []);

  const handleOpenModal = useCallback((modalType: HomeModalType) => {
    setIsModalOpen(true);
    setInfoType(modalType);
  }, []);

  return (
    <Model>
      <Header onOpenModal={handleOpenModal} />
      <CrashCount />
      <AdevertSection />
      <MainAction onOpenModal={handleOpenModal} />
      {isModalOpen ? (
        <HomeModal
          infoType={infoType}
          isOpen={isModalOpen}
          handleClose={handleModalClose}
          ruleCategory={ruleCategory}
          handleRuleClose={handleRuleCategoryClose}
          openRuleCategory={openRuleCategory}
        />
      ) : null}
    </Model>
  );
};

export default Home;
