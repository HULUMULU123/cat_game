import React, { Suspense } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";

interface ModelProps {
  children?: React.ReactNode;
}

// Обертка, чтобы модель занимала весь экран
const ModelWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

// Контент поверх 3D
const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* поверх canvas */
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Компонент модели
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}
useGLTF.preload("/models/stakan_room.glb");

const Model: React.FC<ModelProps> = ({ children }) => {
  return (
    <ModelWrapper>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<span style={{ color: "white" }}>Loading...</span>}>
          <GLTFModel url="/models/stakan_room.glb" />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      <Content>{children}</Content>
    </ModelWrapper>
  );
};

export default Model;
