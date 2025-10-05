import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const modelUrls = [
  "/models/anim1.glb",
  "/models/anim2.glb",
  "/models/anim3.glb",
  "/models/anim4.glb",
];

export default function CatModel() {
  const [currentUrl, setCurrentUrl] = useState(() => {
    return modelUrls[Math.floor(Math.random() * modelUrls.length)];
  });

  const gltf = useGLTF(currentUrl);
  const mixer = useRef<THREE.AnimationMixer>();

  // 🟢 Обработка анимации
  useEffect(() => {
    if (!gltf?.scene) return;

    mixer.current = new THREE.AnimationMixer(gltf.scene);

    if (gltf.animations.length > 0) {
      const clip = gltf.animations[0];
      const action = mixer.current.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();

      mixer.current.addEventListener("finished", () => {
        setCurrentUrl(
          modelUrls[Math.floor(Math.random() * modelUrls.length)]
        );
      });
    }

    // 🟢 Исправляем материалы, чтобы не просвечивали
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.Material & { alphaTest?: number };
          mat.transparent = false;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
          mat.alphaTest = 0.5; // для альфа-текстур
        }
      }
    });
  }, [gltf]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  if (!gltf?.scene) return null;

  return (
    <primitive
      object={gltf.scene}
      scale={1.3}
      position={[0.2, 3, -0.6]}
      rotation={[0, Math.PI -.3, 0]}
      castShadow
      receiveShadow
    />
  );
}
