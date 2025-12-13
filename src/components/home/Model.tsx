import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import StakanLoader from "../../shared/components/stakan/StakanLoader";
import wordmark from "../../assets/STAKAN.svg";
import useGlobalStore from "../../shared/store/useGlobalStore";
import { request } from "../../shared/api/httpClient";
import type { FrontendConfigResponse } from "../../shared/api/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import useQualityProfile from "../../shared/hooks/useQualityProfile";
import { detectAndroidTelegramWebView, isLiteModeForced } from "../../shared/utils/env";

const LazyModelScene = React.lazy(() => import("./ModelScene"));

/* --------------------------- Styled Components --------------------------- */

const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 420ms ease;
`;

const ModelWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const CanvasFade = styled.div<{ $visible: boolean }>`
  width: 100%;
  height: 100vh;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 280ms ease;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 1;
`;

const ConfigSpinnerWrapper = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
`;

const LiteBadge = styled.div`
  position: fixed;
  top: 12px;
  right: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(0, 40, 20, 0.85);
  color: #c9ffd9;
  border: 1px solid rgba(0, 255, 128, 0.4);
  font-size: 13px;
  z-index: 2000;
  backdrop-filter: blur(6px);
`;

const ErrorPanel = styled.div`
  position: fixed;
  bottom: 12px;
  left: 12px;
  max-width: min(420px, 90vw);
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(32, 0, 0, 0.8);
  color: #ffd9d9;
  border: 1px solid rgba(255, 80, 80, 0.4);
  font-size: 13px;
  z-index: 2000;
  backdrop-filter: blur(6px);
`;

const ErrorLine = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const RestartButton = styled.button`
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 128, 128, 0.6);
  background: rgba(0, 0, 0, 0.45);
  color: #ffd9d9;
  cursor: pointer;
  font-weight: 600;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(0, 255, 128, 0.05), #020202),
    radial-gradient(circle at 80% 10%, rgba(0, 255, 128, 0.04), transparent);
`;

/* === Кнопка громкости (FAB) === */
const SoundFab = styled.button<{ $level: number }>`
  position: fixed;
  right: 20px;
  bottom: 200px;
  z-index: 1000;
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid rgba(0, 255, 128, 0.6);
  background: radial-gradient(
    120% 120% at 50% 30%,
    rgba(0, 255, 128, 0.22),
    rgba(0, 0, 0, 0.6)
  );
  box-shadow: 0 8px 30px rgba(0, 255, 128, 0.25),
    inset 0 0 12px rgba(0, 255, 128, 0.15);
  color: #d1ffe7;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease,
    border-color 160ms ease, opacity 200ms ease;
  backdrop-filter: blur(6px);

  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }

  ${(p) =>
    p.$level === 0
      ? `opacity: 0.85; border-color: rgba(255, 255, 255, 0.25);`
      : p.$level === 1
      ? `box-shadow: 0 8px 30px rgba(0, 255, 128, 0.28), inset 0 0 14px rgba(0, 255, 128, 0.22);`
      : p.$level === 2
      ? `box-shadow: 0 10px 36px rgba(0, 255, 128, 0.34), inset 0 0 16px rgba(0, 255, 128, 0.3);`
      : `box-shadow: 0 12px 44px rgba(0, 255, 128, 0.42), inset 0 0 18px rgba(0, 255, 128, 0.36);`}
`;

const LevelBadge = styled.span`
  position: absolute;
  right: -6px;
  top: -6px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid rgba(0, 255, 128, 0.6);
  background: rgba(0, 20, 10, 0.8);
  color: #b7ffd8;
  font-size: 12px;
  line-height: 22px;
  text-align: center;
  pointer-events: none;
`;

/* ----------------------------- Константы ------------------------------ */

const DEFAULT_SCREEN_TEXTURE = "/textures/screen_image.jpeg";
const LOADER_PHRASES = [
  "Не делай вид, что случайно зашёл. Мы оба знаем правду.",
  "Минутку… я хомяка от розетки оттаскиваю.",
  "Я не торможу — это стиль такой.",
  "Ты заходишь слишком часто… я что, настолько классный?",
  "Знаешь, мы оба могли бы быть продуктивнее.",
  "Если кажется, что долго — значит, ты прав.",
  "Ты здесь так часто, что я уже привык к твоему лицу.",
  "Иногда, чтобы двигаться, нужно подождать самого себя.",
  "Я почти тут… почти.",
  "Скажи честно… тебе без меня грустно?",
  "Подожди чуть-чуть, я кэш прочищаю лапкой.",
  "Процесс идёт по плану. План — отсутствует",
  "Если долго грузит — я просто кабель шевелил.",
  "Пока ты здесь — мир становится логичнее.",
  "Не торопи, я синхронизируюсь с реальностью.",
  "Ща, я перезагружу вселенную и продолжим.",
  "Я бы загрузился быстрее, но у меня характер.",
  "Ты зашёл? Ох… всё, попался.",
  "Если лагает — это хомяк делает аирдроп себе, не тебе.",
  "Ты мне нравишься, поэтому тапки пока чистые.",
  "Так… проверяю, я ли это загрузился.",
  "Ого, снова ты… ну давай, делай вид, что случайно.",
  "Остынь… а то я согрею твой тапок по-своему.",
  "Я знаю, что долго… но красиво же, да?",
  "Ты мог бы тоже что-нибудь сделать… но ладно.",
  "Минутку… я пароль от Wi-Fi вспоминаю.",
  "Никогда не спорь с котом. Он всё равно победит молча.",
  "Я знал, что ты придёшь. Ты всегда приходишь.",
  "Погодь, я балансирую на одном пикселе.",
  "Иногда, чтобы найти себя, надо просто обновиться.",
  "Дай угадаю… скучал?",
  "Не шипи… я и так стараюсь.",
  "Не нервничай, я баги складываю в коробку.",
  "Я загружаюсь, как умею — изящно медленно.",
  "Сосед-хомяк опять провод перегрыз… вот и всё лагает.",
  "Мы оба знаем, кто кого выбрал.",
  "Ты тут так часто, что я уже привык к твоему лицу.",
  "Успокойся, я не завис — я медитирую.",
  "Секунду, я объясняю, где кнопка “далее”.",
  "Да я почти всё! Просто пакет данных убежал.",
  "Ты возвращаешься быстрее, чем я успеваю устать от тебя.",
  "Когда кот задумался — мир подождёт.",
  "Хочешь ускорить процесс? Погладь кота. Он обиделся.",
  "Давай без нервов, а то тапочки пострадают.",
  "Я почти готов, не моргай.",
  "Это не загрузка. Это пауза на осознание себя.",
  "Ну что ты нервничаешь, оперативка перегружена.",
  "Секунду, я ищу кнопку “ускориться”.",
  "Не торопись, мне надо красиво появиться.",
  "Когда кот задумался — мир подождёт.",
  "Я не отвлёкся — я энергию экономлю.",
  "Это не ты вернулся — это я тебя позвал.",
];

/* -------------------------- Icons --------------------------- */

const IconSpeakerMute = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 9v6h4l5 4V5L7 9H3z" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M16 9l5 6M21 9l-5 6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
const IconSpeakerLow = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 9v6h4l5 4V5L7 9H3z" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M16 12c0-1.1-.9-2-2-2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M14 16c1.1 0 2-.9 2-2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
const IconSpeakerMid = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 9v6h4l5 4V5L7 9H3z" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M16 8c1.8 1.2 1.8 6.8 0 8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
const IconSpeakerHigh = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 9v6h4l5 4V5L7 9H3z" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M16 7c2.7 2 2.7 8 0 10"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M18.5 5c3.7 3 3.7 12 0 15"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

/* -------------------------- Component --------------------------- */

const VOLUME_STEPS = [0, 0.33, 0.66, 1] as const;

const Model: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const loaderSubtitle = useMemo(() => {
    if (!LOADER_PHRASES.length) return "Гружу 3D-сцену…";
    const idx = Math.floor(Math.random() * LOADER_PHRASES.length);
    return LOADER_PHRASES[idx];
  }, []);

  const [firstFrame, setFirstFrame] = useState(false);
  const [manualHold, setManualHold] = useState(true);
  const [postReadyHold, setPostReadyHold] = useState(true);
  const [sceneMounted, setSceneMounted] = useState(false);
  const [progressState, setProgressState] = useState({ active: true, progress: 0 });
  const [contextLost, setContextLost] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [sceneKey, setSceneKey] = useState(0);
  const [liteMode, setLiteMode] = useState(false);

  const { active, progress } = progressState;

  const {
    settings: { render: renderQuality },
    isLiteDevice,
  } = useQualityProfile({
    preferLiteProfile: true,
    forceProfile: liteMode ? "low" : undefined,
    overrides: useMemo(
      () =>
        liteMode
          ? {
              render: {
                dpr: [0.5, 0.9],
                enableShadows: false,
                enablePostprocessing: false,
                enableEnvironment: false,
                enableFog: false,
                lightIntensityMultiplier: 0.7,
                shadowMapSize: 512,
              },
            }
          : undefined,
      [liteMode]
    ),
  });

  const effectiveLite = liteMode || isLiteDevice;

  const isBottomNavVisible = useGlobalStore((state) => state.isBottomNavVisible);
  const [screenTextureFromConfig, setScreenTextureFromConfig] =
    useState<string>(DEFAULT_SCREEN_TEXTURE);

  const {
    data: frontendConfig,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
  } = useQuery<FrontendConfigResponse>({
    queryKey: ["frontend-config"],
    queryFn: () => request<FrontendConfigResponse>("/frontend/config/"),
  });

  useEffect(() => {
    setLiteMode(detectAndroidTelegramWebView());
  }, []);
  useEffect(() => {
    if (isLiteModeForced()) {
      setLiteMode(true);
    }
  }, []);

  useEffect(() => {
    if (isConfigError && configError) {
      console.error("[Model] screen texture load error", configError);
    }
  }, [isConfigError, configError]);

  useEffect(() => {
    const incoming = frontendConfig?.screen_texture?.trim();
    if (incoming) {
      setScreenTextureFromConfig(incoming);
    } else {
      setScreenTextureFromConfig(DEFAULT_SCREEN_TEXTURE);
    }
  }, [frontendConfig]);

  useEffect(() => {
    const t = setTimeout(() => setManualHold(false), 300);
    return () => clearTimeout(t);
  }, [sceneKey]);

  useEffect(() => {
    const delay = effectiveLite ? 700 : 350;
    const t = setTimeout(() => setSceneMounted(true), delay);
    return () => clearTimeout(t);
  }, [effectiveLite, sceneKey]);

  const readyCanvas =
    sceneMounted && !active && progress >= 100 && firstFrame && !manualHold;

  useEffect(() => {
    if (!readyCanvas) return;
    const t = setTimeout(() => setPostReadyHold(false), 260);
    return () => clearTimeout(t);
  }, [readyCanvas]);

  const [volumeIndex, setVolumeIndex] = useState(0);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!rainRef.current) rainRef.current = new Audio("/audio/rain.mp3");
    if (!musicRef.current) musicRef.current = new Audio("/audio/music.mp3");
    const rainAudio = rainRef.current;
    const musicAudio = musicRef.current;
    [rainAudio, musicAudio].forEach((a) => {
      if (a) {
        a.loop = true;
        a.volume = VOLUME_STEPS[volumeIndex];
      }
    });
    return () => {
      rainAudio?.pause();
      musicAudio?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const vol = VOLUME_STEPS[volumeIndex];
    const update = (audio?: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.volume = vol;
      if (vol > 0) {
        audio.play().catch((e) => {
          console.warn("[audio] autoplay failed", e);
        });
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    };
    update(rainRef.current);
    update(musicRef.current);
  }, [volumeIndex]);

  const cycleVolume = () => setVolumeIndex((i) => (i + 1) % VOLUME_STEPS.length);

  const currentIcon =
    volumeIndex === 0 ? (
      <IconSpeakerMute />
    ) : volumeIndex === 1 ? (
      <IconSpeakerLow />
    ) : volumeIndex === 2 ? (
      <IconSpeakerMid />
    ) : (
      <IconSpeakerHigh />
    );
  const levelLabel = ["off", "low", "mid", "max"][volumeIndex];

  const canvasBg = readyCanvas && !postReadyHold ? "#002200" : "#000000";
  const showLoader = !readyCanvas || postReadyHold || !sceneMounted;

  const handleProgress = useCallback(
    (payload: { active: boolean; progress: number }) => {
      setProgressState(payload);
    },
    []
  );

  const pushError = useCallback((message: string) => {
    setErrorMessages((prev) => [...prev.slice(-3), message]);
    console.error("[Model] runtime error", message);
  }, []);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      pushError(event?.message || "Unknown error");
    };
    const onUnhandled = (event: PromiseRejectionEvent) => {
      pushError(String(event?.reason ?? "Unhandled rejection"));
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, [pushError]);

  const handleContextLost = useCallback(
    (reason: string) => {
      setContextLost(true);
      pushError(reason);
    },
    [pushError]
  );

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
  }, []);

  const restartScene = useCallback(() => {
    setContextLost(false);
    setFirstFrame(false);
    setPostReadyHold(true);
    setManualHold(true);
    setProgressState({ active: true, progress: 0 });
    setSceneMounted(false);
    setSceneKey((k) => k + 1);
    import("./ModelScene")
      .then((m) => m.disposeSceneResources?.())
      .catch((err) => console.warn("[Model] dispose failed", err));
  }, []);

  useEffect(
    () => () => {
      import("./ModelScene")
        .then((m) => m.disposeSceneResources?.())
        .catch(() => {});
    },
    []
  );

  return (
    <ModelWrapper>
      {effectiveLite ? (
        <LiteBadge>Lite режим: урезаем 3D, чтобы не крашился WebView</LiteBadge>
      ) : null}

      {contextLost || errorMessages.length ? (
        <ErrorPanel>
          {contextLost ? (
            <ErrorLine>
              WebGL контекст потерян. Нажми «Перезапустить сцену» — мы отключили
              тяжёлые эффекты.
            </ErrorLine>
          ) : null}
          {errorMessages.map((err, idx) => (
            <ErrorLine key={idx}>• {err}</ErrorLine>
          ))}
          <RestartButton onClick={restartScene}>Перезапустить сцену</RestartButton>
        </ErrorPanel>
      ) : null}

      <CanvasFade $visible={readyCanvas}>
        {sceneMounted ? (
          <Suspense fallback={<Placeholder />}>
            <LazyModelScene
              key={sceneKey}
              renderQuality={renderQuality}
              showLoader={showLoader}
              canvasBg={canvasBg}
              screenTexture={screenTextureFromConfig || DEFAULT_SCREEN_TEXTURE}
              liteMode={effectiveLite}
              onFirstFrame={() => setFirstFrame(true)}
              onProgress={handleProgress}
              onContextLost={handleContextLost}
              onContextRestored={handleContextRestored}
            />
          </Suspense>
        ) : (
          <Placeholder />
        )}
      </CanvasFade>

      {createPortal(
        <LoaderTopLayer $visible={showLoader}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle={loaderSubtitle}
            stopAt={96}
            totalDuration={8000}
          />
        </LoaderTopLayer>,
        document.body
      )}

      {isBottomNavVisible ? (
        <SoundFab
          onClick={cycleVolume}
          aria-label="Volume"
          title="Volume"
          $level={volumeIndex}
        >
          {currentIcon}
          <LevelBadge>{levelLabel}</LevelBadge>
        </SoundFab>
      ) : null}

      <Content>
        {isConfigLoading ? (
          <ConfigSpinnerWrapper>
            <LoadingSpinner label="Обновляем сцену" />
          </ConfigSpinnerWrapper>
        ) : null}
        {children}
      </Content>
    </ModelWrapper>
  );
};

export default Model;
