import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import useQualityProfile from "../../shared/hooks/useQualityProfile";

const primaryModelUrl = "/models/anim1.glb";
const secondaryModelUrls = [
  "/models/anim2.glb",
  "/models/anim3.glb",
  "/models/anim4.glb",
];

// Предзагружаем основные ассеты, чтобы не блокировать Suspense
useGLTF.preload(primaryModelUrl);
secondaryModelUrls.forEach((url) => useGLTF.preload(url));

const getClipKey = (clip: THREE.AnimationClip): string =>
  clip.uuid || clip.name || String(clip.id);

export default function CatModel() {
  const primaryModel = useGLTF(primaryModelUrl);
  const animModel2 = useGLTF(secondaryModelUrls[0]);
  const animModel3 = useGLTF(secondaryModelUrls[1]);
  const animModel4 = useGLTF(secondaryModelUrls[2]);

  const {
    settings: {
      animation: { enableFrustumCulling },
    },
  } = useQualityProfile();

  const scene = useMemo(() => {
    const cloned = SkeletonUtils.clone(primaryModel.scene) as THREE.Group;
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = enableFrustumCulling ? true : false;
      }
    });
    return cloned;
  }, [primaryModel.scene, enableFrustumCulling]);

  const animations = useMemo(() => {
    const clips = [
      ...(primaryModel.animations ?? []),
      ...(animModel2.animations ?? []),
      ...(animModel3.animations ?? []),
      ...(animModel4.animations ?? []),
    ];

    return clips.map((clip) => {
      const clone = clip.clone();
      clone.optimize();
      return clone;
    });
  }, [
    primaryModel.animations,
    animModel2.animations,
    animModel3.animations,
    animModel4.animations,
  ]);

  const mixer = useRef<THREE.AnimationMixer>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const actionCache = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const clipRegistry = useRef<Map<string, THREE.AnimationClip>>(new Map());

  useEffect(() => {
    const registry = clipRegistry.current;
    registry.clear();
    animations.forEach((clip) => {
      registry.set(getClipKey(clip), clip);
    });
  }, [animations]);

  const getActionForClip = useCallback((clip: THREE.AnimationClip) => {
    if (!mixer.current) return null;
    const key = getClipKey(clip);
    clipRegistry.current.set(key, clip);
    let action = actionCache.current.get(key);
    if (!action) {
      action = mixer.current.clipAction(clip);
      action.clampWhenFinished = true;
      action.setLoop(THREE.LoopOnce, 1);
      actionCache.current.set(key, action);
    }

    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);

    return action;
  }, []);

  // Инициализация миксера и старт первой анимации
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    if (!mixer.current) mixer.current = new THREE.AnimationMixer(scene);

    const clip = animations[0];
    const next = getActionForClip(clip);
    if (!next) return;

    next.reset();
    next.play();

    currentAction.current = next;
    setCurrentIndex(0);

    return () => {
      actionCache.current.forEach((cachedAction, key) => {
        cachedAction.stop();
        cachedAction.reset();
        const clip = clipRegistry.current.get(key);
        if (clip) {
          mixer.current?.uncacheAction(clip, scene);
          mixer.current?.uncacheClip(clip);
        }
      });
      actionCache.current.clear();
      clipRegistry.current.clear();
      mixer.current?.stopAllAction();
      if (scene) mixer.current?.uncacheRoot(scene);
    };
  }, [scene, animations, getActionForClip]);

  // Переключение по завершению текущего клипа: 0 → 1 → 2 → 3 → 0 …
  useEffect(() => {
    if (!mixer.current || animations.length === 0) return;
    const mixerInstance = mixer.current;

    const handleFinished = () => {
      const nextIndex = (currentIndex + 1) % animations.length;
      const nextClip = animations[nextIndex];

      const next = getActionForClip(nextClip);
      if (!next) return;

      const previousAction = currentAction.current;

      next.reset();
      next.play();

      if (previousAction && previousAction !== next) {
        previousAction.crossFadeTo(next, 0.6, false);
        previousAction.reset();
      }

      currentAction.current = next;
      setCurrentIndex(nextIndex);
    };

    mixerInstance.addEventListener("finished", handleFinished);
    return () => {
      mixerInstance.removeEventListener("finished", handleFinished);
    };
  }, [currentIndex, animations, getActionForClip]);

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
    return () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((mat) => mat?.dispose());
        }
      });
    };
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
