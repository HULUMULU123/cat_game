import React, { useState } from "react";
import Header from "../components/home/Header";
import Model from "../components/home/Model";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";
import MainAction from "../components/home/MainAction";
import HomeModal from "../components/homeExtraInfo/HomeModal";


export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [infoType, setInfoType] = useState('')
  const handleModalClose = () => {
    setIsModalOpen(false);
    setInfoType('');
  }
  return (
    <Model>
      <Header setInfoType={setInfoType}/>
      <CrashCount/>
      <AdevertSection />
      <MainAction/>
      {isModalOpen ? <HomeModal infoType={infoType} isOpen={isModalOpen} setIsOpen={setIsModalOpen}/> : null}
    </Model>
  );
}
