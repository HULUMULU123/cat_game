import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import useQualityProfile from "../../shared/hooks/useQualityProfile";

const primaryModelUrl = "/models/anim1.glb";
const secondaryModelUrls = [
  "/models/anim2.glb",
  "/models/anim3.glb",
  "/models/anim4.glb",
];

// Предзагружаем основные ассеты, чтобы не блокировать Suspense
useGLTF.preload(primaryModelUrl);

const getClipKey = (clip: THREE.AnimationClip): string =>
  clip.uuid || clip.name || String(clip.id);

export default function CatModel() {
  const primaryModel = useGLTF(primaryModelUrl);
  const [extraClips, setExtraClips] = useState<THREE.AnimationClip[]>([]);

  const {
    profile,
    settings: {
      animation: { enableFrustumCulling }, // сейчас игнорируем, но оставляем в коде
    },
  } = useQualityProfile();

  const isLite = profile === "low";

  const scene = useMemo(() => {
    const cloned = SkeletonUtils.clone(primaryModel.scene) as THREE.Group;

    cloned.traverse((child) => {
      // ВАЖНО: полностью отключаем frustum culling для всех мешей
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = child as THREE.SkinnedMesh;
        skinned.frustumCulled = false;
        return;
      }

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;
      }
    });

    return cloned;
  }, [primaryModel.scene, enableFrustumCulling]);

  useEffect(() => {
    if (isLite) {
      setExtraClips([]);
      return;
    }

    let cancelled = false;
    const loader = new GLTFLoader();

    (async () => {
      const collected: THREE.AnimationClip[] = [];
      for (const url of secondaryModelUrls) {
        try {
          const gltf = await loader.loadAsync(url);
          if (cancelled) return;
          collected.push(...(gltf.animations ?? []));
        } catch (e) {
          console.warn("[CatModel] failed to load extra anim", url, e);
        }
      }
      if (!cancelled) setExtraClips(collected);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLite]);

  const animations = useMemo(() => {
    const clips = [
      ...(primaryModel.animations ?? []),
      ...extraClips,
    ];

    const prepared = clips.map((clip) => {
      const clone = clip.clone();
      clone.optimize();
      return clone;
    });

    if (isLite) {
      // Оставляем только лёгкие/базовые клипы: idle + первый вторичный (обычно blink)
      return prepared.slice(0, 2);
    }

    return prepared;
  }, [primaryModel.animations, extraClips, isLite]);

  const mixer = useRef<THREE.AnimationMixer>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const actionCache = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const clipRegistry = useRef<Map<string, THREE.AnimationClip>>(new Map());
  const fadeCleanupTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const FADE_DURATION = 0.6;

  const playAnimation = useCallback(
    (index: number, fadeFrom?: THREE.AnimationAction | null) => {
      if (!mixer.current || animations.length === 0) return;
      const clip = animations[index];
      if (!clip) return;

      const next = getActionForClip(clip);
      if (!next) return;

      const previous = fadeFrom ?? currentAction.current;

      next.reset();
      next.play();

      if (previous && previous !== next) {
        next.crossFadeFrom(previous, FADE_DURATION, false);

        const timer = setTimeout(() => {
          previous.stop();
          previous.reset();
          fadeCleanupTimers.current = fadeCleanupTimers.current.filter(
            (t) => t !== timer
          );
        }, FADE_DURATION * 1000 + 50);

        fadeCleanupTimers.current.push(timer);
      }

      currentAction.current = next;
      currentIndexRef.current = index;
      setCurrentIndex(index);
    },
    [animations, getActionForClip]
  );

  // Инициализация миксера и старт первой анимации
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    if (!mixer.current) mixer.current = new THREE.AnimationMixer(scene);

    playAnimation(0);

    return () => {
      fadeCleanupTimers.current.forEach((timer) => clearTimeout(timer));
      fadeCleanupTimers.current = [];

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
  }, [scene, animations, playAnimation]);

  // Переключение по завершению текущего клипа: 0 → 1 → 2 → 3 → 0 …
  useEffect(() => {
    if (!mixer.current || animations.length === 0) return;
    const mixerInstance = mixer.current;

    const handleFinished = (
      event: THREE.Event & { action?: THREE.AnimationAction }
    ) => {
      const finishedAction = event.action ?? currentAction.current;
      if (!animations.length) return;

      const nextIndex = (currentIndexRef.current + 1) % animations.length;
      playAnimation(nextIndex, finishedAction ?? undefined);
    };

    mixerInstance.addEventListener("finished", handleFinished);
    return () => {
      mixerInstance.removeEventListener("finished", handleFinished);
    };
  }, [animations, playAnimation]);

  useFrame((_, delta) => {
    const speed = isLite ? 0.6 : 1;
    mixer.current?.update(delta * speed);
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
          // Убираем прозрачность и делаем двусторонние полигоны
          mat.transparent = false;
          mat.depthWrite = true;
          mat.side = THREE.DoubleSide;
        });
      }
    });

    return () => {};
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
