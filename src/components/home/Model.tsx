import React, { Suspense, useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF, Html } from "@react-three/drei";
import { EffectComposer, Bloom, HueSaturation } from "@react-three/postprocessing";
import * as THREE from "three";
import CatModel from "./CatModel";

interface ModelProps {
  children?: React.ReactNode;
}

const ModelWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

// Компонент комнаты + кот за стулом
function RoomWithCat({ url, onLoaded }: { url: string, onLoaded?: () => void  }) {
  const { scene } = useGLTF(url);
  const catRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene || !catRef.current) return;
    onLoaded()
    let chair: THREE.Object3D | null = null;
    let screenMesh: THREE.Mesh | null = null;
    let windowMesh: THREE.Mesh | null = null;

    scene.traverse((obj) => {
      if (obj.name.toLowerCase().includes("chair")) chair = obj;
      if (obj.name.toLowerCase().includes("screen") && (obj as THREE.Mesh).isMesh)
        screenMesh = obj as THREE.Mesh;
      if (obj.name.toLowerCase().includes("window") && (obj as THREE.Mesh).isMesh)
        windowMesh = obj as THREE.Mesh;
    });

    // 🪑 Позиционируем кота за стулом
    if (chair) {
      const pos = new THREE.Vector3();
      chair.getWorldPosition(pos);
      const dir = new THREE.Vector3();
      chair.getWorldDirection(dir);
      catRef.current.position.copy(pos).add(dir.multiplyScalar(-0.6));
      catRef.current.position.y += 0.05;
    }

    // 🖼️ Изображение для "экрана"
    if (screenMesh) {
      const loader = new THREE.TextureLoader();
      loader.load("/textures/screen_image.jpeg", (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
        });
        screenMesh.material.needsUpdate = true;
      });
    }

    // 🌧️ Видео дождя в "окно"
    if (windowMesh) {
      const video = document.createElement("video");
      video.src = "/videos/rain.mp4"; // помести видео сюда: public/videos/rain.mp4
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      video.style.display = "none";
      video.playbackRate = 0.7; // не показываем элемент в DOM
      document.body.appendChild(video);

      // Пытаемся запустить
      const tryPlay = async () => {
        try {
          await video.play();
          console.log("✅ Видео дождя запущено");
        } catch (err) {
          console.warn("⚠️ Видео не запущено автоматически:", err);
        }
      };
      tryPlay();

      // Создаём видео-текстуру
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.flipY = false;
      videoTexture.center.set(0.5, 0.5);       // центр вращения — середина текстуры
      videoTexture.rotation = Math.PI / 2;    // поворот на 90° против часовой стрелки
      videoTexture.repeat.set(2.5, 2.5);           // при необходимости можно масштабировать
      videoTexture.offset.set(-0.1, 0); 

      windowMesh.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      windowMesh.material.needsUpdate = true;
      
      
    }
  }, [scene]);

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

const LoaderOverlay = styled.div`
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5em;
  background: rgba(0, 0, 0, 0.3); /* полупрозрачный фон */
  z-index: 10;
`;

const Model: React.FC<ModelProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <ModelWrapper>
      {!isLoaded && <LoaderOverlay>Loading...</LoaderOverlay>}
      <Canvas shadows camera={{ position: [10, -.5, 5], fov: 50, rotation: [0.0, 0.77, 0] }}>
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

        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="lime" transparent opacity={0.4} />
        </mesh>

        <Suspense fallback={null} onLoaded={() => setIsLoaded(true)}>
          {/* Комната + кот за стулом */}
          <RoomWithCat url="/models/stakan_room.glb" onLoaded={() => setIsLoaded(true)}/>
          <Environment preset="city" background />
        </Suspense>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

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
