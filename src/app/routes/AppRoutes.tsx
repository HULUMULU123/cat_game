import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../../components/Layout";
import StakanLoader from "../../shared/components/stakan/StakanLoader";
import wordmark from "../../assets/STAKAN.svg";

const HomePage = lazy(() => import("../../pages/Home"));
const TasksPage = lazy(() => import("../../pages/Tasks"));
const QuizPage = lazy(() => import("../../pages/Quiz"));
const SimulationPage = lazy(() => import("../../pages/Simulation"));
const PrizePage = lazy(() => import("../../pages/Prize"));
const FailurePage = lazy(() => import("../../pages/Failure"));
const SimulationPracticePage = lazy(
  () => import("../../pages/SimulationPractice")
);

const AppRoutes = () => (
  <Suspense fallback={<StakanLoader wordmarkSrc={wordmark} subtitle="Гружу страницу…" />}>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks/" element={<TasksPage />} />
        <Route path="quiz/" element={<QuizPage />} />
        <Route path="simulation/" element={<SimulationPage />} />
        <Route path="prize/" element={<PrizePage />} />
        <Route path="failure/" element={<FailurePage />} />
      </Route>
      <Route path="/simulation/practice/" element={<SimulationPracticePage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
