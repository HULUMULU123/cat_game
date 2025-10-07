import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, HueSaturation } from "@react-three/postprocessing";
import * as THREE from "three";
import CatModel from "./CatModel";

/* --------------------------- Styled Components --------------------------- */

const ModelWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 1;
`;

const LoaderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5em;
  background: rgba(0, 0, 0, 1);
  z-index: 1000000;
`;

/* ----------------------------- Кэш ресурсов ------------------------------ */

// Кэш для моделей, текстур и видео
const modelCache = new Map<string, any>();
const textureCache = new Map<string, THREE.Texture>();
const videoCache = new Map<string, HTMLVideoElement>();

/* ------------------------- Компонент комнаты ----------------------------- */

function RoomWithCat({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  // Используем кэш модели, если она уже загружена
  const { scene } = useMemo(() => {
    if (modelCache.has(url)) return modelCache.get(url);
    const model = useGLTF(url);
    modelCache.set(url, model);
    return model;
  }, [url]);

  const catRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene || !catRef.current) return;
    onLoaded?.();

    let chair: THREE.Object3D | null = null;
    let screenMesh: THREE.Mesh | null = null;
    let windowMesh: THREE.Mesh | null = null;

    // Поиск нужных объектов в сцене
    scene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (name.includes("chair")) chair = obj;
      if (name.includes("screen") && (obj as THREE.Mesh).isMesh)
        screenMesh = obj as THREE.Mesh;
      if (name.includes("window") && (obj as THREE.Mesh).isMesh)
        windowMesh = obj as THREE.Mesh;
    });

    // 🪑 Размещаем кота за стулом
    if (chair) {
      const pos = new THREE.Vector3();
      const dir = new THREE.Vector3();
      chair.getWorldPosition(pos);
      chair.getWorldDirection(dir);
      catRef.current.position.copy(pos).add(dir.multiplyScalar(-0.6));
      catRef.current.position.y += 0.05;
    }

    // 🖼️ Устанавливаем текстуру на "экран"
    if (screenMesh) {
      const textureURL = "/textures/screen_image.jpeg";
      if (textureCache.has(textureURL)) {
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: textureCache.get(textureURL)!,
          toneMapped: false,
        });
      } else {
        const loader = new THREE.TextureLoader();
        loader.load(textureURL, (texture) => {
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          textureCache.set(textureURL, texture);
          screenMesh.material = new THREE.MeshBasicMaterial({
            map: texture,
            toneMapped: false,
          });
          screenMesh.material.needsUpdate = true;
        });
      }
    }

    // 🌧️ Видео дождя в "окно"
    if (windowMesh) {
      const videoURL = "/videos/rain.mp4";
      let video = videoCache.get(videoURL);

      // Создаём элемент видео только один раз
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

      // Запуск видео
      video.play().catch((err) => console.warn("⚠️ Видео не запущено:", err));

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
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
      windowMesh.material.needsUpdate = true;
    }
  }, [scene, onLoaded]);

  return (
    <>
      <primitive object={scene} scale={1.5} castShadow receiveShadow />
      <group ref={catRef}>
        <CatModel />
      </group>
    </>
  );
}

// Предзагрузка модели
useGLTF.preload("/models/stakan_room.glb");

/* -------------------------- Основной компонент --------------------------- */

const Model: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 Инициализация звуков с кэшированием
  useEffect(() => {
    if (!rainRef.current) rainRef.current = new Audio("/audio/rain.mp3");
    if (!musicRef.current) musicRef.current = new Audio("/audio/music.mp3");

    [rainRef.current, musicRef.current].forEach((audio) => {
      if (audio) {
        audio.loop = true;
        audio.volume = 0.7;
      }
    });

    return () => {
      rainRef.current?.pause();
      musicRef.current?.pause();
    };
  }, []);

  // ▶️ Включение аудио по клику
  const handleStartAudio = async () => {
    try {
      await rainRef.current?.play();
      await musicRef.current?.play();
      setAudioReady(true);
    } catch (err) {
      console.warn("Не удалось запустить аудио:", err);
    }
  };

  return (
    <ModelWrapper>
      {!isLoaded && <LoaderOverlay>Loading...</LoaderOverlay>}

      {!audioReady && (
        <div
          style={{
            position: "absolute",
            bottom: "200px",
            right: "30px",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleStartAudio}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              background: "rgba(0,255,0,0.2)",
              border: "1px solid lime",
              color: "white",
              cursor: "pointer",
            }}
          >
            🔊 Включить звук
          </button>
        </div>
      )}

      <Canvas shadows camera={{ position: [10, 0.5, 5], fov: 50, rotation: [0, 0.77, 0] }}>
        {/* Общий фон и освещение */}
        <color attach="background" args={["#002200"]} />
        <fog attach="fog" args={["#002200", 10, 40]} />

        <ambientLight intensity={0.6} color="#00ff1d" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          color="#00ff1d"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, -1, 0]} intensity={1.2} color="#00ff1d" distance={15} />
        <pointLight position={[0, 2, 0]} intensity={2} distance={5} color="lime" />

        {/* Светящаяся сфера */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="lime" transparent opacity={0.4} />
        </mesh>

        {/* Комната с котом */}
        <Suspense fallback={null}>
          <RoomWithCat url="/models/stakan_room.glb" onLoaded={() => setIsLoaded(true)} />
          <Environment preset="forest" background />
        </Suspense>

        {/* Плоскость под комнатой для теней */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Постобработка */}
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          <HueSaturation hue={0.3} saturation={0.5} />
        </EffectComposer>
      </Canvas>

      <Content>{children}</Content>
    </ModelWrapper>
  );
};

export default Model;
