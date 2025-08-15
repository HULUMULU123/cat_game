import React from "react";
import Header from "../components/home/Header";
import Model from "../components/home/Model";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";
import MainAction from "../components/home/MainAction";

export default function Home() {
  return (
    <Model>
      <Header />
      <CrashCount/>
      <AdevertSection />
      <MainAction/>
    </Model>
  );
}
