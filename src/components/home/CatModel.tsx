import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const modelUrls = [
  "/models/anim1.glb",
  "/models/anim2.glb",
  "/models/anim3.glb",
  "/models/anim4.glb",
];

// Предзагрузка всех моделей
modelUrls.forEach((url) => useGLTF.preload(url));

function getRandomIndex(length: number, exclude?: number) {
  if (length <= 1) return 0;
  let idx = exclude ?? -1;
  while (idx === exclude) {
    idx = Math.floor(Math.random() * length);
  }
  return idx;
}

export default function CatModel() {
  const models = modelUrls.map((url) => useGLTF(url));

  // Берём сцену из первой модели без клонирования
  const scene = useMemo(() => models[0].scene, [models]);
  const animations = useMemo(
    () => models.flatMap((m) => m.animations || []),
    [models]
  );

  const mixer = useRef<THREE.AnimationMixer>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  // Инициализация миксера и старт со случайной анимации
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    if (!mixer.current) mixer.current = new THREE.AnimationMixer(scene);

    const startIndex = getRandomIndex(animations.length);
    setCurrentIndex(startIndex);

    const clip = animations[startIndex];
    const action = mixer.current.clipAction(clip);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    currentAction.current = action;

    return () => {
      mixer.current?.stopAllAction();
    };
  }, [scene, animations]);

  // Случайное переключение по завершению текущего клипа
  useEffect(() => {
    if (!mixer.current || animations.length === 0) return;
    const mixerInstance = mixer.current;

    const handleFinished = () => {
      const nextIndex = getRandomIndex(animations.length, currentIndex);
      const nextClip = animations[nextIndex];

      const nextAction = mixerInstance.clipAction(nextClip);
      nextAction.reset();
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
      nextAction.play();

      if (currentAction.current) {
        currentAction.current.crossFadeTo(nextAction, 0.6, false);
      }

      currentAction.current = nextAction;
      setCurrentIndex(nextIndex);
    };

    mixerInstance.addEventListener("finished", handleFinished);
    return () => {
      mixerInstance.removeEventListener("finished", handleFinished);
    };
  }, [currentIndex, animations]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  // Исправляем материалы
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((mat) => {
          mat.transparent = false;
          mat.depthWrite = true;
          mat.side = THREE.FrontSide;
        });
      }
    });
  }, [scene]);

  // Заворачиваем сцену в <group>, чтобы задать позицию и ротацию
  return (
    <group
      scale={1.3}
      position={[-3.7, -6.7, -5.3]}
      rotation={[0, Math.PI - 0.3, 0]}
      castShadow
      receiveShadow
    >
      <primitive object={scene} />
    </group>
  );
}
