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
    // случайный старт
    return modelUrls[Math.floor(Math.random() * modelUrls.length)];
  });

  const gltf = useGLTF(currentUrl);
  const mixer = useRef<THREE.AnimationMixer>();

  useEffect(() => {
    if (!gltf?.scene) return;

    mixer.current = new THREE.AnimationMixer(gltf.scene);

    if (gltf.animations.length > 0) {
      const clip = gltf.animations[0];
      const action = mixer.current.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1); // проигрываем один раз
      action.clampWhenFinished = true;   // остановиться в конце
      action.play();

      console.log("Playing animation:", clip.name);

      // Когда закончится — выбираем следующую случайную модель
      mixer.current.addEventListener("finished", () => {
        setCurrentUrl(
          modelUrls[Math.floor(Math.random() * modelUrls.length)]
        );
      });
    }
  }, [gltf]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  if (!gltf?.scene) return null;

  return (
    <primitive
      object={gltf.scene}
      scale={1.2}
      position={[.5, 3, -.2]}
      rotation={[0, Math.PI, 0]}
      castShadow
      receiveShadow
    />
  );
}
