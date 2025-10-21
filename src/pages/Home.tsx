import React, { useState } from "react";
import Header from "../components/home/Header";
import Model from "../components/home/Model";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";
import MainAction from "../components/home/MainAction";
import HomeModal from "../components/homeExtraInfo/HomeModal";
import usePageReady from "../hooks/usePageReady";


export default function Home() {
  usePageReady();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [infoType, setInfoType] = useState('')
  const [ruleCategory, setRuleCategory] = useState('')
  const handleModalClose = () => {
    setIsModalOpen(false);
    setInfoType('');
  }

  const openRuleCategory = (ruleCat) => {
    setRuleCategory(ruleCat);
    setInfoType('rule_category');
  }
  const handleRuleCatgoryClose = () => {
    setRuleCategory('');
    setInfoType('rules')
  }
  const handleOpenModal = (modalType) => {
    setIsModalOpen(true);
    setInfoType(modalType)
  }
    return (
    <Model>
      <Header handleOpenModal={handleOpenModal}/>
      <CrashCount/>
      <AdevertSection />
      <MainAction handleOpenModal={handleOpenModal}/>
      {isModalOpen ? <HomeModal infoType={infoType} isOpen={isModalOpen} handleClose={handleModalClose} ruleCategory={ruleCategory} handleRuleClose={handleRuleCatgoryClose} openRuleCategory={openRuleCategory}/> : null}
    </Model>
  );
}
