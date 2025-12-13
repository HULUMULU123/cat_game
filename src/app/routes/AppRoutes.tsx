import { lazy, Suspense, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../../components/Layout";
import StakanLoader from "../../shared/components/stakan/StakanLoader";
import wordmark from "../../assets/STAKAN.svg";

const LOADER_PHRASES = [
  "Не делай вид, что случайно зашёл. Мы оба знаем правду.",
  'Минутку… я хомяка от розетки оттаскиваю.',
  'Я не торможу — это стиль такой.',
  'Ты заходишь слишком часто… я что, настолько классный?',
  'Знаешь, мы оба могли бы быть продуктивнее.',
  'Если кажется, что долго — значит, ты прав.',
  'Ты здесь так часто, что я уже привык к твоему лицу.',
  'Иногда, чтобы двигаться, нужно подождать самого себя.',
  'Я почти тут… почти.',
  'Скажи честно… тебе без меня грустно?',
  'Подожди чуть-чуть, я кэш прочищаю лапкой.',
  'Процесс идёт по плану. План — отсутствует',
  'Если долго грузит — я просто кабель шевелил.',
  'Пока ты здесь — мир становится логичнее.',
  'Не торопи, я синхронизируюсь с реальностью.',
  'Ща, я перезагружу вселенную и продолжим.',
  'Я бы загрузился быстрее, но у меня характер.',
  'Ты зашёл? Ох… всё, попался.',
  'Если лагает — это хомяк делает аирдроп себе, не тебе.',
  'Ты мне нравишься, поэтому тапки пока чистые.',
  'Так… проверяю, я ли это загрузился.',
  'Ого, снова ты… ну давай, делай вид, что случайно.',
  'Остынь… а то я согрею твой тапок по-своему.',
  'Я знаю, что долго… но красиво же, да?',
  'Ты мог бы тоже что-нибудь сделать… но ладно.',
  'Минутку… я пароль от Wi-Fi вспоминаю.',
  'Никогда не спорь с котом. Он всё равно победит молча.',
  'Я знал, что ты придёшь. Ты всегда приходишь.',
  'Погодь, я балансирую на одном пикселе.',
  'Иногда, чтобы найти себя, надо просто обновиться.',
  'Дай угадаю… скучал?',
  'Не шипи… я и так стараюсь.',
  'Не нервничай, я баги складываю в коробку.',
  'Я загружаюсь, как умею — изящно медленно.',
  'Сосед-хомяк опять провод перегрыз… вот и всё лагает.',
  'Мы оба знаем, кто кого выбрал.',
  'Ты тут так часто, что я уже привык к твоему лицу.',
  'Успокойся, я не завис — я медитирую.',
  'Секунду, я объясняю, где кнопка “далее”.',
  'Да я почти всё! Просто пакет данных убежал.',
  'Ты возвращаешься быстрее, чем я успеваю устать от тебя.',
  'Когда кот задумался — мир подождёт.',
  'Хочешь ускорить процесс? Погладь кота. Он обиделся.',
  'Давай без нервов, а то тапочки пострадают.',
  'Я почти готов, не моргай.',
  'Это не загрузка. Это пауза на осознание себя.',
  'Ну что ты нервничаешь, оперативка перегружена.',
  'Секунду, я ищу кнопку “ускориться”.',
  'Не торопись, мне надо красиво появиться.',
  'Когда кот задумался — мир подождёт.',
  'Я не отвлёкся — я энергию экономлю.',
  'Это не ты вернулся — это я тебя позвал.',
];

const HomePage = lazy(() => import("../../pages/Home"));
const TasksPage = lazy(() => import("../../pages/Tasks"));
const QuizPage = lazy(() => import("../../pages/Quiz"));
const SimulationPage = lazy(() => import("../../pages/Simulation"));
const PrizePage = lazy(() => import("../../pages/Prize"));
const FailurePage = lazy(() => import("../../pages/Failure"));
const SimulationPracticePage = lazy(
  () => import("../../pages/SimulationPractice")
);

const AppRoutes = () => {
  const loaderSubtitle = useMemo(() => {
    if (!LOADER_PHRASES.length) return "Гружу страницу…";
    const idx = Math.floor(Math.random() * LOADER_PHRASES.length);
    return LOADER_PHRASES[idx];
  }, []);

  return (
    <Suspense
      fallback={<StakanLoader wordmarkSrc={wordmark} subtitle={loaderSubtitle} />}
    >
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
};

export default AppRoutes;
