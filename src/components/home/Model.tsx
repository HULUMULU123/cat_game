import React, { Suspense, useRef, useEffect, useState } from "react";
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
import useQualityProfile from "../../shared/hooks/useQualityProfile";

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

const Fallback = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(120% 120% at 50% 30%, rgba(20, 16, 32, 0.7), rgba(6, 10, 18, 0.9));
  color: #dfe6f7;
  text-align: center;
  z-index: 2147483650;
`;

const FallbackCard = styled.div`
  max-width: 420px;
  width: 100%;
  padding: 20px 18px;
  border-radius: 14px;
  background: rgba(8, 12, 18, 0.8);
  border: 1px solid rgba(159, 122, 255, 0.3);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
`;

const FallbackTitle = styled.div`
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const FallbackText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const FallbackButton = styled.button`
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9f7aff, #6d8cff);
  color: #0b0f18;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:active {
    transform: translateY(1px);
  }
`;

/* ----------------------------- Кэш ресурсов ------------------------------ */

const textureCache = new Map<string, THREE.Texture>();
const videoCache = new Map<string, HTMLVideoElement>();

const DEFAULT_SCREEN_TEXTURE = "/textures/screen_image.jpeg";

/* --------------------- Вспомогательные функции -------------------------- */

const resolveTextureUrl = (url?: string | null): string => {
  const base = DEFAULT_SCREEN_TEXTURE;

  if (typeof url !== "string") return base;
  const trimmed = url.trim();
  if (!trimmed) return base;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) {
    if (typeof window !== "undefined") {
      return window.location.protocol + trimmed;
    }
    return "https:" + trimmed;
  }
  if (trimmed.startsWith("/")) {
    if (typeof window !== "undefined") {
      return window.location.origin + trimmed;
    }
    return trimmed;
  }

  if (typeof window !== "undefined") {
    try {
      return new URL(trimmed, window.location.origin).toString();
    } catch {
      return base;
    }
  }

  return base;
};

const downscaleIfNeeded = (
  img: HTMLImageElement,
  maxSize: number
): HTMLCanvasElement | HTMLImageElement => {
  const width = (img as any).naturalWidth ?? (img as any).width;
  const height = (img as any).naturalHeight ?? (img as any).height;
  if (!width || !height) return img;

  if (width <= maxSize && height <= maxSize) return img;

  const ratio = Math.min(maxSize / width, maxSize / height);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;

  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas;
};

const createTextureFromImageSource = (
  imageSource: HTMLImageElement | HTMLCanvasElement
): THREE.Texture => {
  const texture = new THREE.Texture(imageSource);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = 1;
  texture.needsUpdate = true;
  return texture;
};

const tuneExistingTexture = (
  texture: THREE.Texture | null | undefined,
  maxSize: number,
  degrade: boolean
) => {
  if (!texture) return;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = !degrade;
  texture.anisotropy = 1;

  if (degrade) {
    const img: any = (texture as any).image;
    if (img && typeof img.width === "number" && typeof img.height === "number") {
      const downscaled = downscaleIfNeeded(img, maxSize);
      if (downscaled !== img) {
        (texture as any).image = downscaled;
        texture.needsUpdate = true;
      }
    }
  }
};

const loadScreenTexture = async (
  url: string,
  maxSize: number
): Promise<THREE.Texture> => {
  const targetURL = resolveTextureUrl(url);
  const cacheKey = `${targetURL}__${maxSize}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        console.error("[screen] image has no size", targetURL);
        if (targetURL !== resolveTextureUrl(DEFAULT_SCREEN_TEXTURE)) {
          loadScreenTexture(DEFAULT_SCREEN_TEXTURE, maxSize).then(resolve);
        } else {
          resolve(new THREE.Texture());
        }
        return;
      }

      const safeSource = downscaleIfNeeded(img, maxSize);
      const texture = createTextureFromImageSource(safeSource);
      textureCache.set(cacheKey, texture);
      resolve(texture);
    };

    img.onerror = (err) => {
      console.error("[screen] image load error", targetURL, err);
      const fallbackURL = resolveTextureUrl(DEFAULT_SCREEN_TEXTURE);
      if (targetURL !== fallbackURL) {
        loadScreenTexture(DEFAULT_SCREEN_TEXTURE, maxSize).then(resolve);
      } else {
        resolve(new THREE.Texture());
      }
    };

    img.src = targetURL;
  });
};

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
  isLite,
  maxTextureSize,
}: {
  url: string;
  onLoaded?: () => void;
  screenTexture: string;
  isLite: boolean;
  maxTextureSize: number;
}) {
  const gltf = useGLTF(url);
  const { scene } = gltf;

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
    const materialsToDispose: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];

    const tuneMaterial = (mat: THREE.Material) => {
      const typed = mat as any;
      ["map", "emissiveMap", "normalMap", "roughnessMap", "metalnessMap"].forEach(
        (key) => tuneExistingTexture(typed[key], maxTextureSize, isLite)
      );
      if (isLite && "metalness" in typed) typed.metalness = Math.min(typed.metalness ?? 0, 0.08);
      if (isLite && "roughness" in typed) typed.roughness = Math.min(
        Math.max(typed.roughness ?? 0.5, 0.45),
        1
      );
    };

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = !isLite && mesh.castShadow;
        mesh.receiveShadow = !isLite && mesh.receiveShadow;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach(tuneMaterial);
      }
    });

    if (screenMesh) {
      const textureURL = screenTexture || DEFAULT_SCREEN_TEXTURE;
      const p = loadScreenTexture(textureURL, maxTextureSize).then((texture) => {
        texture.needsUpdate = true;
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
        });
        screenMesh.material = material;
        materialsToDispose.push(material);
        texturesToDispose.push(texture);
        (screenMesh.material as THREE.Material).needsUpdate = true;
      });
      waiters.push(p);
    }

    if (windowMesh) {
      if (isLite) {
        const material = new THREE.MeshBasicMaterial({
          color: "#1c1f29",
          toneMapped: false,
          side: THREE.DoubleSide,
        });
        windowMesh.material = material;
        materialsToDispose.push(material);
        (windowMesh.material as THREE.Material).needsUpdate = true;
      } else {
      const videoURL = "/videos/rain.mp4";
      let video = videoCache.get(videoURL);

      if (!video && typeof document !== "undefined") {
        video = document.createElement("video");
        video.src = videoURL;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        (video as any).playsInline = true;
        video.autoplay = true;
        video.preload = "auto";
        video.style.display = "none";
        video.playbackRate = 0.7;
        document.body.appendChild(video);
        videoCache.set(videoURL, video);
      }

      if (video) {
        const videoReady = new Promise<void>((resolve) => {
          if (
            video!.readyState >= 2 &&
            video!.videoWidth &&
            video!.videoHeight
          ) {
            resolve();
          } else {
            const done = () => {
              if (video!.videoWidth && video!.videoHeight) resolve();
              else resolve(); // всё равно даём шанс, но уже после реального кадра
            };
            video!.addEventListener("canplay", done, { once: true });
            video!.addEventListener("loadeddata", done, { once: true });
          }
        });

        video.play().catch((e) => {
          console.warn("[window video] autoplay failed", e);
        });

        const p = videoReady.then(() => {
          if (!video!.videoWidth || !video!.videoHeight) {
            console.warn("[window video] zero size, skip texture");
            return;
          }

          const videoTexture = new THREE.VideoTexture(video!);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          videoTexture.format = THREE.RGBFormat;
          (videoTexture as any).colorSpace = THREE.SRGBColorSpace;
          videoTexture.flipY = false;
          videoTexture.center.set(0.5, 0.5);
          videoTexture.rotation = Math.PI / 2;
          videoTexture.repeat.set(2.5, 2.5);
          videoTexture.offset.set(-0.1, 0);

          const material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            toneMapped: false,
            side: THREE.DoubleSide,
          });
          windowMesh.material = material;
          materialsToDispose.push(material);
          texturesToDispose.push(videoTexture);
          (windowMesh.material as THREE.Material).needsUpdate = true;
        });

        waiters.push(p);
      }
      }
    }

    Promise.all(waiters).then(() => onLoaded?.());

    return () => {
      materialsToDispose.forEach((mat) => mat.dispose?.());
      texturesToDispose.forEach((tex) => tex.dispose?.());
    };
  }, [scene, onLoaded, screenTexture, isLite, maxTextureSize]);

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
  const {
    profile,
    settings: { render: renderQuality },
    forceLowProfile,
  } = useQualityProfile();
  const isLite = profile === "low";
  const isBottomNavVisible = useGlobalStore(
    (state) => state.isBottomNavVisible
  );
  const [screenTexture, setScreenTexture] = useState(DEFAULT_SCREEN_TEXTURE);
  const [isContextLost, setIsContextLost] = useState(false);
  const [maxTextureSize, setMaxTextureSize] = useState(() =>
    isLite ? 1024 : 4096
  );
  const glCleanupRef = useRef<(() => void) | null>(null);
  const [showFallback, setShowFallback] = useState(false);

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
    } else {
      setScreenTexture(DEFAULT_SCREEN_TEXTURE);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const vol = VOLUME_STEPS[volumeIndex];
    const setVol = (a?: HTMLAudioElement | null) => {
      if (!a) return;
      a.volume = vol;
      if (vol > 0) {
        a.play().catch((e) => {
          console.warn("[audio] autoplay failed", e);
        });
      } else {
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

  const baseCanvasBg = isLite ? "#0b0f18" : "#002200";
  // Для устранения вспышки: пока идёт кроссфейд — фон Canvas чёрный, затем переключаем на основной
  const canvasBg = readyCanvas && !postReadyHold ? baseCanvasBg : "#000000";
  const showLoader = !readyCanvas || postReadyHold;
  const fogEnabled = renderQuality.enableFog && canvasBg === baseCanvasBg;
  const shadowsEnabled = renderQuality.enableShadows && !isLite && !isContextLost;
  const shadowOpacity = shadowsEnabled ? 0.3 : 0;

  useEffect(() => {
    setMaxTextureSize(isLite ? 1024 : 4096);
    THREE.DefaultLoadingManager.setURLModifier((url) => url); // no-op to keep instance
    (THREE.DefaultLoadingManager as any).maxConnections = isLite ? 1 : 4;
  }, [isLite]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent?.toLowerCase?.() ?? "";
    if (ua.includes("android") && (ua.includes("telegram") || ua.includes("tgapp"))) {
      forceLowProfile("android-telegram");
    }
  }, [forceLowProfile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMemoryPressure = () => {
      setShowFallback(true);
      forceLowProfile("memory-pressure");
    };
    window.addEventListener("memorypressure" as any, handleMemoryPressure);
    return () => window.removeEventListener("memorypressure" as any, handleMemoryPressure);
  }, [forceLowProfile]);

  const handleCanvasCreated = (state: { gl: THREE.WebGLRenderer }) => {
    const { gl } = state;
    gl.setPixelRatio(renderQuality.dpr);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      setIsContextLost(true);
      setShowFallback(true);
      forceLowProfile("webgl-lost");
    };
    const onRestore = () => {
      setIsContextLost(false);
      setShowFallback(false);
    };
    canvas.addEventListener("webglcontextlost", onLost, { passive: false });
    canvas.addEventListener("webglcontextrestored", onRestore, { passive: false });
    glCleanupRef.current = () => {
      canvas.removeEventListener("webglcontextlost", onLost as any);
      canvas.removeEventListener("webglcontextrestored", onRestore as any);
      gl.dispose();
    };
  };

  useEffect(
    () => () => {
      glCleanupRef.current?.();
    },
    []
  );

  useEffect(() => {
    if (showFallback) {
      glCleanupRef.current?.();
      glCleanupRef.current = null;
    }
  }, [showFallback]);

  return (
    <ModelWrapper>
      {!showFallback && (
        /* Canvas появляется первым (на чёрном фоне), лоадер уходит вторым — кроссфейд без «зелёной» щели */
        <CanvasFade $visible={readyCanvas}>
          <Canvas
            shadows={shadowsEnabled}
            dpr={renderQuality.dpr}
            camera={{ position: [10, 0.5, 5], fov: 50, rotation: [0, 0.77, 0] }}
            style={{ width: "100%", height: "100vh", display: "block" }}
            gl={{
              powerPreference: isLite ? "low-power" : "high-performance",
              alpha: false,
              antialias: !isLite,
            }}
            onCreated={handleCanvasCreated}
          >
            <color attach="background" args={[canvasBg]} />
            {fogEnabled && <fog attach="fog" args={[baseCanvasBg, 10, 40]} />}

            <FirstFrame onReady={() => setFirstFrame(true)} />

            <ambientLight intensity={0.4 * renderQuality.lightIntensityMultiplier} color="#f0e8d9" />
            <directionalLight
              position={[6, 6, 4]}
              intensity={0.9 * renderQuality.lightIntensityMultiplier}
              color="#ffd8b1"
              castShadow={shadowsEnabled}
              shadow-mapSize-width={renderQuality.shadowMapSize}
              shadow-mapSize-height={renderQuality.shadowMapSize}
            />
            <pointLight
              position={[-3, 1.5, 2]}
              intensity={0.3 * renderQuality.lightIntensityMultiplier}
              color="#dbe5ff"
              distance={15}
            />
            <pointLight
              position={[1.5, 1.2, -1]}
              intensity={0.7 * renderQuality.lightIntensityMultiplier}
              distance={6}
              color="#9f7aff"
            />

            <Suspense fallback={null}>
              <RoomWithCat
                url="/models/stakan_room.glb"
                onLoaded={() => {}}
                screenTexture={screenTexture}
                isLite={isLite}
                maxTextureSize={maxTextureSize}
              />
              {/* Монтируем Environment с background ТОЛЬКО после кроссфейда */}
              {!showLoader && renderQuality.enableEnvironment && !isLite && (
                <Environment preset="forest" background />
              )}
            </Suspense>

            <mesh
              receiveShadow={shadowsEnabled}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -1.5, 0]}
            >
              <planeGeometry args={[50, 50]} />
              <shadowMaterial opacity={shadowOpacity} />
            </mesh>

            {renderQuality.enablePostprocessing && !isLite && (
              <EffectComposer>
                <Bloom
                  intensity={0.4 * renderQuality.lightIntensityMultiplier}
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.9}
                />
                <HueSaturation hue={0.3} saturation={0.5} />
              </EffectComposer>
            )}
          </Canvas>
        </CanvasFade>
      )}

      {showFallback && (
        <Fallback>
          <FallbackCard>
            <FallbackTitle>3D отключена</FallbackTitle>
            <FallbackText>
              WebGL недоступен или устройство испытывает нехватку ресурсов. Мы включили лёгкий режим, чтобы избежать вылета.
            </FallbackText>
            <FallbackButton onClick={() => window.location.reload()}>
              Перезапустить сцену
            </FallbackButton>
          </FallbackCard>
        </Fallback>
      )}

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
