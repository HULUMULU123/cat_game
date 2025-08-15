import { useState } from "react";
import Header from "./components/home/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout-обёртка для всех вложенных маршрутов */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tasks/" element={<Tasks/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
