import React, { Suspense, useRef, useEffect } from "react";
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
function RoomWithCat({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const catRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene || !catRef.current) return;

    // ищем объект с "chair" в имени
    let chair: THREE.Object3D | null = null;
    scene.traverse((obj) => {
      console.log(obj.name); // полезно, чтобы узнать доступные имена
      if (obj.name.toLowerCase().includes("chair")) {
        chair = obj;
      }
    });

    if (chair) {
      const chairPos = new THREE.Vector3();
      chair.getWorldPosition(chairPos);

      const dir = new THREE.Vector3();
      chair.getWorldDirection(dir);

      // позиционируем кота позади стула
      catRef.current.position.copy(chairPos).add(dir.multiplyScalar(-0.6));
      catRef.current.position.y += 0.05;
    } else {
      console.warn("❌ Стул не найден. Проверь имена в console.log(obj.name)");
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

const Model: React.FC<ModelProps> = ({ children }) => {
  return (
    <ModelWrapper>
      <Canvas shadows camera={{ position: [6, -2, 4], fov: 50, rotation: [0.1, 0.65, 0] }}>
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

        <Suspense
          fallback={
            <Html center style={{ color: "white" }}>
              Loading...
            </Html>
          }
        >
          {/* Комната + кот за стулом */}
          <RoomWithCat url="/models/stakan_room.glb" />
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
