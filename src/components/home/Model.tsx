import React, { Suspense } from "react";
import styled from "styled-components";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";

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
  justify-content: center;
  flex-direction: column;
`;

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

        {/* fallback теперь внутри 3D через Html */}
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

        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Контент поверх канваса */}
      <Content>{children}</Content>
    </ModelWrapper>
  );
};

export default Model;
