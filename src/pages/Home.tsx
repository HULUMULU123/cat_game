import React from "react";
import Header from "../components/home/Header";
import Model from "../components/home/Model";
import CrashCount from "../components/home/CrashCount";
import AdevertSection from "../components/home/AdevertSection";

export default function Home() {
  return (
    <Model>
      <Header />
      <CrashCount/>
      <AdevertSection />
    </Model>
  );
}
