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

const getClipKey = (clip: THREE.AnimationClip): string =>
  clip.uuid || clip.name || String(clip.id);

interface CatModelProps {
  liteMode?: boolean;
}

export default function CatModel({ liteMode = false }: CatModelProps) {
  const primaryModel = useGLTF(primaryModelUrl);
  const [secondaryAnimations, setSecondaryAnimations] = useState<
    THREE.AnimationClip[]
  >([]);

  const {
    settings: {
      animation: { enableFrustumCulling },
    },
  } = useQualityProfile({
    preferLiteProfile: liteMode,
    forceProfile: liteMode ? "low" : undefined,
    overrides: liteMode
      ? {
          animation: { enableFrustumCulling: true },
        }
      : undefined,
  });

  useEffect(() => {
    if (liteMode) {
      setSecondaryAnimations([]);
      return;
    }

    let isCancelled = false;
    const loader = new GLTFLoader();
    loader.setCrossOrigin("anonymous");

    const queue = [...secondaryModelUrls];

    const loadNext = () => {
      if (isCancelled) return;
      const next = queue.shift();
      if (!next) return;

      loader.load(
        next,
        (gltf) => {
          if (isCancelled) return;
          setSecondaryAnimations((prev) => [...prev, ...(gltf.animations ?? [])]);
          loadNext();
        },
        undefined,
        (err) => {
          if (isCancelled) return;
          console.warn("[CatModel] failed to load animation", next, err);
          loadNext();
        }
      );
    };

    loadNext();
    return () => {
      isCancelled = true;
    };
  }, [liteMode]);

  const mixer = useRef<THREE.AnimationMixer>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const actionCache = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const clipRegistry = useRef<Map<string, THREE.AnimationClip>>(new Map());
  const fadeCleanupTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Кость челюсти/подбородка, которую будем править вручную
  const jawBoneRef = useRef<THREE.Bone | null>(null);

  const scene = useMemo(() => {
    const cloned = SkeletonUtils.clone(primaryModel.scene) as THREE.Group;

    cloned.traverse((child) => {
      // Для skinned-мешей отключаем frustum culling
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = child as THREE.SkinnedMesh;
        skinned.frustumCulled = false;

        // Пытаемся найти кость челюсти/подбородка/рта по имени
        if (skinned.skeleton && !jawBoneRef.current) {
          const candidate = skinned.skeleton.bones.find((bone) => {
            const n = bone.name.toLowerCase();
            return (
              n.includes("jaw") || n.includes("chin") || n.includes("mouth")
            );
          });
          if (candidate) {
            jawBoneRef.current = candidate;
          }
        }

        return;
      }

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
      ...secondaryAnimations,
    ];
    const limited = liteMode ? clips.slice(0, Math.min(2, clips.length)) : clips;

    return limited.map((clip) => {
      const clone = clip.clone();
      clone.optimize();
      return clone;
    });
  }, [
    primaryModel.animations,
    secondaryAnimations,
    liteMode,
  ]);

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
    // Ручная коррекция кости челюсти — не даём её слишком сплющивать
    if (jawBoneRef.current) {
      const bone = jawBoneRef.current;
      const minScale = 0.9; // можешь поиграть этим значением

      bone.scale.set(
        Math.max(bone.scale.x, minScale),
        Math.max(bone.scale.y, minScale),
        Math.max(bone.scale.z, minScale)
      );
      bone.updateMatrixWorld(true);
    }

    mixer.current?.update(delta);
  });

  // Исправляем материалы
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        const shouldUseDoubleSide =
          name.includes("head") ||
          name.includes("face") ||
          name.includes("chin");
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((mat) => {
          mat.transparent = false;
          mat.depthWrite = true;
          mat.side = shouldUseDoubleSide ? THREE.DoubleSide : THREE.FrontSide;
        });
      }
    });

    return () => {};
  }, [scene]);

  // Доп. лог, чтобы ты мог в консоли посмотреть имена костей
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinned = child as THREE.SkinnedMesh;
        if (skinned.skeleton) {
          console.log(
            "SkinnedMesh:",
            skinned.name,
            "bones:",
            skinned.skeleton.bones.map((b) => b.name)
          );
        }
      }
    });
  }, [scene]);

  // Заворачиваем сцену в <group>, чтобы задать позицию и ротацию
  useEffect(
    () => () => {
      if (!scene) return;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((mat) => mat.dispose?.());
        }
      });
    },
    [scene]
  );

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
