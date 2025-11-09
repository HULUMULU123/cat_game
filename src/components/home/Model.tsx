import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, useProgress } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  HueSaturation,
} from "@react-three/postprocessing";
import * as THREE from "three";
import CatModel from "./CatModel";
import { createPortal } from "react-dom";

/** загрузочный экран */
import StakanLoader from "../../shared/components/stakan/StakanLoader";
import wordmark from "../../assets/STAKAN.svg";
import useGlobalStore from "../../shared/store/useGlobalStore";
import { request } from "../../shared/api/httpClient";
import type { FrontendConfigResponse } from "../../shared/api/types";
import { useQuery } from "react-query";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

/* --------------------------- Styled Components --------------------------- */

const LoaderTopLayer = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 420ms ease; /* лоадер уходит ЧУТЬ позже Canvas */
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
  transition: opacity 280ms ease; /* Canvas появляется раньше лоадера */
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

/* ----------------------------- Кэш ресурсов ------------------------------ */

const modelCache = new Map<string, any>();
const textureCache = new Map<string, THREE.Texture>();
const videoCache = new Map<string, HTMLVideoElement>();
const DEFAULT_SCREEN_TEXTURE = "/textures/screen_image.jpeg";

/* ------------------------- Уведомление о первом кадре -------------------- */

function FirstFrame({ onReady }: { onReady: () => void }) {
  const doneRef = useRef(false);
  useFrame(() => {
    if (!doneRef.current) {
      doneRef.current = true;
      onReady();
    }
  });
  return null;
}

/* ------------------------- Иконки громкости (SVG) ------------------------ */

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

/* ------------------------- Компонент комнаты ----------------------------- */

function RoomWithCat({
  url,
  onLoaded,
  screenTexture,
}: {
  url: string;
  onLoaded?: () => void;
  screenTexture: string;
}) {
  const { scene } = useMemo(() => {
    if (modelCache.has(url)) return modelCache.get(url);
    const model = useGLTF(url);
    modelCache.set(url, model);
    return model;
  }, [url]);

  const catRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene || !catRef.current) return;

    let chair: THREE.Object3D | null = null;
    let screenMesh: THREE.Mesh | null = null;
    let windowMesh: THREE.Mesh | null = null;

    scene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (name.includes("chair")) chair = obj;
      if (name.includes("screen") && (obj as THREE.Mesh).isMesh)
        screenMesh = obj as THREE.Mesh;
      if (name.includes("window") && (obj as THREE.Mesh).isMesh)
        windowMesh = obj as THREE.Mesh;
    });

    if (chair && catRef.current) {
      const pos = new THREE.Vector3();
      const dir = new THREE.Vector3();
      chair.getWorldPosition(pos);
      chair.getWorldDirection(dir);
      catRef.current.position.copy(pos).add(dir.multiplyScalar(-0.6));
      catRef.current.position.y += 0.05;
    }

    const waiters: Promise<any>[] = [];

    if (screenMesh) {
      const textureURL = screenTexture || DEFAULT_SCREEN_TEXTURE;
      if (textureCache.has(textureURL)) {
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: textureCache.get(textureURL)!,
          toneMapped: false,
        });
      } else {
        const p = new Promise<void>((resolve) => {
          new THREE.TextureLoader().load(textureURL, (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            texture.flipY = false;
            textureCache.set(textureURL, texture);
            screenMesh.material = new THREE.MeshBasicMaterial({
              map: texture,
              toneMapped: false,
            });
            (screenMesh.material as THREE.Material).needsUpdate = true;
            resolve();
          });
        });
        waiters.push(p);
      }
    }

    if (windowMesh) {
      const videoURL = "/videos/rain.mp4";
      let video = videoCache.get(videoURL);
      if (!video) {
        video = document.createElement("video");
        video.src = videoURL;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.preload = "auto";
        video.style.display = "none";
        video.playbackRate = 0.7;
        document.body.appendChild(video);
        videoCache.set(videoURL, video);
      }

      const videoReady = new Promise<void>((resolve) => {
        if (video!.readyState >= 2) resolve();
        else {
          const done = () => resolve();
          video!.addEventListener("canplaythrough", done, { once: true });
          video!.addEventListener("loadeddata", done, { once: true });
        }
      });

      video.play().catch(() => {});

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;
      (videoTexture as any).colorSpace = THREE.SRGBColorSpace;
      videoTexture.flipY = false;
      videoTexture.center.set(0.5, 0.5);
      videoTexture.rotation = Math.PI / 2;
      videoTexture.repeat.set(2.5, 2.5);
      videoTexture.offset.set(-0.1, 0);

      windowMesh.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      (windowMesh.material as THREE.Material).needsUpdate = true;

      waiters.push(videoReady);
    }

    Promise.all(waiters).then(() => onLoaded?.());
  }, [scene, onLoaded, screenTexture]);

  return (
    <>
      <primitive object={scene} scale={1.5} castShadow receiveShadow />
      <group ref={catRef}>
        <CatModel />
      </group>
    </>
  );
}

useGLTF.preload("/models/stakan_room.glb");

/* -------------------------- Основной компонент --------------------------- */

const VOLUME_STEPS = [0, 0.33, 0.66, 1] as const; // выкл → низк → средн → макс

const Model: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [firstFrame, setFirstFrame] = useState(false);
  const [manualHold, setManualHold] = useState(true); // короткий буфер от мерцаний
  const [postReadyHold, setPostReadyHold] = useState(true); // холд лоадера ПОСЛЕ появления Canvas
  const { active, progress } = useProgress();
  const isBottomNavVisible = useGlobalStore(
    (state) => state.isBottomNavVisible
  );
  const [screenTexture, setScreenTexture] = useState(DEFAULT_SCREEN_TEXTURE);
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
    if (isConfigError && configError) {
      console.error("[Model] screen texture load error", configError);
    }
  }, [isConfigError, configError]);

  useEffect(() => {
    const incoming = frontendConfig?.screen_texture?.trim();
    if (incoming) {
      setScreenTexture(incoming);
    }
  }, [frontendConfig]);
  // Условия готовности Canvas (для его появления)
  useEffect(() => {
    const t = setTimeout(() => setManualHold(false), 300);
    return () => clearTimeout(t);
  }, []);
  const readyCanvas = !active && progress === 100 && firstFrame && !manualHold;

  // После того как Canvas стал видим, ещё немного держим лоадер (кроссфейд)
  useEffect(() => {
    if (!readyCanvas) return;
    const t = setTimeout(() => setPostReadyHold(false), 260);
    return () => clearTimeout(t);
  }, [readyCanvas]);

  // аудио
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [volumeIndex, setVolumeIndex] = useState(0);

  useEffect(() => {
    if (!rainRef.current) rainRef.current = new Audio("/audio/rain.mp3");
    if (!musicRef.current) musicRef.current = new Audio("/audio/music.mp3");
    [rainRef.current, musicRef.current].forEach((a) => {
      if (a) {
        a.loop = true;
        a.volume = VOLUME_STEPS[volumeIndex];
      }
    });
    return () => {
      rainRef.current?.pause();
      musicRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const vol = VOLUME_STEPS[volumeIndex];
    const setVol = (a?: HTMLAudioElement | null) => {
      if (!a) return;
      a.volume = vol;
      if (vol > 0) a.play().catch(() => {});
      else {
        a.pause();
        a.currentTime = 0;
      }
    };
    setVol(rainRef.current);
    setVol(musicRef.current);
  }, [volumeIndex]);

  const cycleVolume = () =>
    setVolumeIndex((i) => (i + 1) % VOLUME_STEPS.length);

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

  // Для устранения вспышки: пока идёт кроссфейд — фон Canvas чёрный, затем переключаем на зелёный
  const canvasBg = readyCanvas && !postReadyHold ? "#002200" : "#000000";
  const showLoader = !readyCanvas || postReadyHold;

  return (
    <ModelWrapper>
      {/* Canvas появляется первым (на чёрном фоне), лоадер уходит вторым — кроссфейд без «зелёной» щели */}
      <CanvasFade $visible={readyCanvas}>
        <Canvas
          shadows
          camera={{ position: [10, 0.5, 5], fov: 50, rotation: [0, 0.77, 0] }}
          style={{ width: "100%", height: "100vh", display: "block" }}
        >
          <color attach="background" args={[canvasBg]} />
          {canvasBg === "#002200" && (
            <fog attach="fog" args={["#002200", 10, 40]} />
          )}

          <FirstFrame onReady={() => setFirstFrame(true)} />

          <ambientLight intensity={0.6} color="#00ff1d" />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            color="#00ff1d"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight
            position={[0, -1, 0]}
            intensity={1.2}
            color="#00ff1d"
            distance={15}
          />
          <pointLight
            position={[0, 2, 0]}
            intensity={2}
            distance={5}
            color="lime"
          />

          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshBasicMaterial color="lime" transparent opacity={0.4} />
          </mesh>

          <Suspense fallback={null}>
            <RoomWithCat
              url="/models/stakan_room.glb"
              onLoaded={() => {}}
              screenTexture={screenTexture}
            />
            {/* Монтируем Environment с background ТОЛЬКО после кроссфейда */}
            {!showLoader && <Environment preset="forest" background />}
          </Suspense>

          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.5, 0]}
          >
            <planeGeometry args={[50, 50]} />
            <shadowMaterial opacity={0.3} />
          </mesh>

          <EffectComposer>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
            />
            <HueSaturation hue={0.3} saturation={0.5} />
          </EffectComposer>
        </Canvas>
      </CanvasFade>

      {/* Лоадер сверху — уходит ПОСЛЕ появления Canvas */}
      {createPortal(
        <LoaderTopLayer $visible={showLoader}>
          <StakanLoader
            wordmarkSrc={wordmark}
            subtitle="Гружу 3D-сцену…"
            stopAt={96}
            totalDuration={8000}
          />
        </LoaderTopLayer>,
        document.body
      )}

      {/* Кнопка громкости */}
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
