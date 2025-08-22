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

  const handeOpenPrize = () => {
    setIsModalOpen(true);
    setInfoType('prize');

    console.log(infoType, isModalOpen)
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
      {isModalOpen ? <HomeModal infoType={infoType} isOpen={isModalOpen} handleClose={handleModalClose}/> : null}
    </Model>
  );
}
