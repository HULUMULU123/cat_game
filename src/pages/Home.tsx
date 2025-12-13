import { Suspense, lazy, useCallback, useState } from "react";
import Header from "../components/home/Header";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";
import MainAction from "../components/home/MainAction";
import HomeModal from "../components/homeExtraInfo/HomeModal";

import type { HomeModalType, RuleCategory } from "../components/home/types";

import usePageReady from "../shared/hooks/usePageReady";

const Model = lazy(() => import("../components/home/Model"));

const Home = () => {
  usePageReady();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoType, setInfoType] = useState<HomeModalType>("");
  const [ruleCategory, setRuleCategory] = useState<RuleCategory | null>(null);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setInfoType("");
  }, []);

  const openRuleCategory = useCallback((category: RuleCategory) => {
    setRuleCategory(category);
    setInfoType("rule_category");
  }, []);

  const handleRuleCategoryClose = useCallback(() => {
    setRuleCategory(null);
    setInfoType("rules");
  }, []);

  const handleOpenModal = useCallback((modalType: HomeModalType) => {
    setIsModalOpen(true);
    setInfoType(modalType);
  }, []);

  return (
    <Suspense fallback={<div style={{ height: "100vh", background: "#000", color: "#c7ffe0", display: "flex", alignItems: "center", justifyContent: "center" }}>Загружаем 3D…</div>}>
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
    </Suspense>
  );
};

export default Home;
