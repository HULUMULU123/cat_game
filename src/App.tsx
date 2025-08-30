import { useState } from "react";
import Header from "./components/home/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Tasks from "./pages/Tasks";
import Quiz from "./pages/Quiz";
import Simulation from "./pages/Simulation";
import Prize from "./pages/Prize";
import Failure from "./pages/Failure";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout-обёртка для всех вложенных маршрутов */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tasks/" element={<Tasks/>}/>
          <Route path="quiz/" element={<Quiz/>}/>
          <Route path="simulation/" element={<Simulation/>} />
          <Route path="prize/" element={<Prize/>} />
          <Route path="failure/" element={<Failure/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
