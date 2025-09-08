import React, { Suspense } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

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

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} castShadow receiveShadow />;
}
useGLTF.preload("/models/stakan_room.glb");

const Model: React.FC<ModelProps> = ({ children }) => {
  return (
    <ModelWrapper>
      <Canvas shadows camera={{ position: [7, -2, 8], fov: 50 }}>
        {/* Основное мягкое освещение */}
        <ambientLight intensity={0.3} />

        {/* Ключевой свет */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Заполняющий свет */}
        <directionalLight position={[-5, 3, -5]} intensity={0.5} />

        {/* Контровой свет */}
        <pointLight position={[0, 5, -5]} intensity={0.6} />

        {/* Зелёное свечение */}
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

        {/* Модель */}
        <Suspense
          fallback={
            <Html center style={{ color: "white" }}>
              Loading...
            </Html>
          }
        >
          <GLTFModel url="/models/stakan_room.glb" />
          <Environment preset="sunset" />
        </Suspense>

        {/* Плоскость для теней */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.5, 0]}
        >
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Постобработка */}
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        {/* Управление камерой */}
        <OrbitControls enableZoom={true} target={[-10, 1, -20]} />
      </Canvas>

      {/* Контент поверх канваса */}
      <Content>{children}</Content>
    </ModelWrapper>
  );
};

export default Model;
