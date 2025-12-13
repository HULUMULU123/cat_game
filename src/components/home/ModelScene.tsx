import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, useProgress } from "@react-three/drei";
import { EffectComposer, Bloom, HueSaturation } from "@react-three/postprocessing";
import * as THREE from "three";
import CatModel from "./CatModel";
import type { QualityPreset } from "../../shared/hooks/useQualityProfile";

type ProgressPayload = { active: boolean; progress: number };

const DEFAULT_SCREEN_TEXTURE = "/textures/screen_image.jpeg";
const LITE_MAX_TEXTURE_SIZE = 768;
const MAX_TEXTURE_CACHE = 3;
const textureCache = new Map<string, THREE.Texture>();
const videoCache = new Map<string, HTMLVideoElement>();

export const disposeSceneResources = () => {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();

  videoCache.forEach((video) => {
    try {
      video.pause();
      video.src = "";
      video.remove();
    } catch (e) {
      console.warn("[ModelScene] cleanup video failed", e);
    }
  });
  videoCache.clear();
  THREE.Cache.clear();
};

const resolveTextureUrl = (url?: string | null): string => {
  const base = DEFAULT_SCREEN_TEXTURE;

  if (typeof url !== "string") return base;
  const trimmed = url.trim();
  if (!trimmed) return base;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) {
    if (typeof window !== "undefined") {
      return window.location.protocol + trimmed;
    }
    return "https:" + trimmed;
  }
  if (trimmed.startsWith("/")) {
    if (typeof window !== "undefined") {
      return window.location.origin + trimmed;
    }
    return trimmed;
  }

  if (typeof window !== "undefined") {
    try {
      return new URL(trimmed, window.location.origin).toString();
    } catch {
      return base;
    }
  }

  return base;
};

const downscaleIfNeeded = (
  img: HTMLImageElement,
  maxSize: number
): HTMLCanvasElement | HTMLImageElement => {
  const { naturalWidth: width, naturalHeight: height } = img;
  if (!width || !height) return img;

  if (width <= maxSize && height <= maxSize) return img;

  const ratio = Math.min(maxSize / width, maxSize / height);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;

  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas;
};

const createTextureFromImageSource = (
  imageSource: HTMLImageElement | HTMLCanvasElement
): THREE.Texture => {
  const texture = new THREE.Texture(imageSource);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
};

const loadScreenTexture = async (
  url: string,
  maxSize: number
): Promise<THREE.Texture> => {
  const targetURL = resolveTextureUrl(url);
  const cacheKey = `${targetURL}::${maxSize}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        console.error("[screen] image has no size", targetURL);
        if (targetURL !== resolveTextureUrl(DEFAULT_SCREEN_TEXTURE)) {
          loadScreenTexture(DEFAULT_SCREEN_TEXTURE, maxSize).then(resolve);
        } else {
          resolve(new THREE.Texture());
        }
        return;
      }

      const safeSource = downscaleIfNeeded(img, maxSize);
      const texture = createTextureFromImageSource(safeSource);
      if (textureCache.size >= MAX_TEXTURE_CACHE) {
        const firstKey = textureCache.keys().next().value;
        if (firstKey) {
          textureCache.get(firstKey)?.dispose();
          textureCache.delete(firstKey);
        }
      }
      textureCache.set(cacheKey, texture);
      resolve(texture);
    };

    img.onerror = (err) => {
      console.error("[screen] image load error", targetURL, err);
      const fallbackURL = resolveTextureUrl(DEFAULT_SCREEN_TEXTURE);
      if (targetURL !== fallbackURL) {
        loadScreenTexture(DEFAULT_SCREEN_TEXTURE, maxSize).then(resolve);
      } else {
        resolve(new THREE.Texture());
      }
    };

    img.src = targetURL;
  });
};

function FirstFrame({ onReady }: { onReady: () => void }) {
  const doneRef = useRef(false);
  useFrame(() => {
    if (!doneRef.current) {
      doneRef.current = true;
      onReady();
    }
  });
  return null;
}

function RoomWithCat({
  url,
  onLoaded,
  screenTexture,
  liteMode,
  maxTextureSize,
}: {
  url: string;
  onLoaded?: () => void;
  screenTexture: string;
  liteMode: boolean;
  maxTextureSize: number;
}) {
  const gltf = useGLTF(url);
  const { scene } = gltf;

  const catRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene || !catRef.current) return;

    let chair: THREE.Object3D | null = null;
    let screenMesh: THREE.Mesh | null = null;
    let windowMesh: THREE.Mesh | null = null;

    scene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (name.includes("chair")) chair = obj;
      if (name.includes("screen") && (obj as THREE.Mesh).isMesh)
        screenMesh = obj as THREE.Mesh;
      if (name.includes("window") && (obj as THREE.Mesh).isMesh)
        windowMesh = obj as THREE.Mesh;
    });

    if (chair && catRef.current) {
      const pos = new THREE.Vector3();
      const dir = new THREE.Vector3();
      chair.getWorldPosition(pos);
      chair.getWorldDirection(dir);
      catRef.current.position.copy(pos).add(dir.multiplyScalar(-0.6));
      catRef.current.position.y += 0.05;
    }

    const waiters: Promise<any>[] = [];

    if (screenMesh) {
      const textureURL = screenTexture || DEFAULT_SCREEN_TEXTURE;
      const p = loadScreenTexture(textureURL, maxTextureSize).then((texture) => {
        texture.needsUpdate = true;
        screenMesh.material = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
        });
        (screenMesh.material as THREE.Material).needsUpdate = true;
      });
      waiters.push(p);
    }

    if (windowMesh) {
      if (liteMode) {
        windowMesh.material = new THREE.MeshBasicMaterial({
          color: "#0a1a0a",
          toneMapped: false,
        });
        (windowMesh.material as THREE.Material).needsUpdate = true;
      } else {
        const videoURL = "/videos/rain.mp4";
        let video = videoCache.get(videoURL);

        if (!video && typeof document !== "undefined") {
          video = document.createElement("video");
          video.src = videoURL;
          video.crossOrigin = "anonymous";
          video.loop = true;
          video.muted = true;
          (video as any).playsInline = true;
          video.autoplay = true;
          video.preload = "auto";
          video.style.display = "none";
          video.playbackRate = 0.7;
          document.body.appendChild(video);
          videoCache.set(videoURL, video);
        }

        if (video) {
          const videoReady = new Promise<void>((resolve) => {
            if (
              video!.readyState >= 2 &&
              video!.videoWidth &&
              video!.videoHeight
            ) {
              resolve();
            } else {
              const done = () => {
                if (video!.videoWidth && video!.videoHeight) resolve();
                else resolve();
              };
              video!.addEventListener("canplay", done, { once: true });
              video!.addEventListener("loadeddata", done, { once: true });
            }
          });

          video.play().catch((e) => {
            console.warn("[window video] autoplay failed", e);
          });

          const p = videoReady.then(() => {
            if (!video!.videoWidth || !video!.videoHeight) {
              console.warn("[window video] zero size, skip texture");
              return;
            }

            const videoTexture = new THREE.VideoTexture(video!);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBFormat;
            (videoTexture as any).colorSpace = THREE.SRGBColorSpace;
            videoTexture.flipY = false;
            videoTexture.center.set(0.5, 0.5);
            videoTexture.rotation = Math.PI / 2;
            videoTexture.repeat.set(2.5, 2.5);
            videoTexture.offset.set(-0.1, 0);

            windowMesh.material = new THREE.MeshBasicMaterial({
              map: videoTexture,
              toneMapped: false,
              side: THREE.DoubleSide,
            });
            (windowMesh.material as THREE.Material).needsUpdate = true;
          });

          waiters.push(p);
        }
      }
    }

    Promise.all(waiters).then(() => onLoaded?.());
  }, [scene, onLoaded, screenTexture, liteMode, maxTextureSize]);

  return (
    <>
      <primitive object={scene} scale={1.5} castShadow receiveShadow />
      <group ref={catRef}>
        <CatModel liteMode={liteMode} />
      </group>
    </>
  );
}

interface ModelSceneProps {
  renderQuality: QualityPreset["render"];
  showLoader: boolean;
  canvasBg: string;
  screenTexture: string;
  liteMode: boolean;
  onFirstFrame: () => void;
  onProgress: (payload: ProgressPayload) => void;
  onContextLost: (reason: string) => void;
  onContextRestored: () => void;
}

const ModelScene: React.FC<ModelSceneProps> = ({
  renderQuality,
  showLoader,
  canvasBg,
  screenTexture,
  liteMode,
  onFirstFrame,
  onProgress,
  onContextLost,
  onContextRestored,
}) => {
  const { active, progress } = useProgress();

  useEffect(() => {
    onProgress({ active, progress });
  }, [active, progress, onProgress]);

  const fogEnabled = renderQuality.enableFog && canvasBg === "#002200";
  const ambientIntensity = 0.7 * renderQuality.lightIntensityMultiplier;
  const directionalIntensity = 1.1 * renderQuality.lightIntensityMultiplier;
  const pointBottomIntensity = 1.3 * renderQuality.lightIntensityMultiplier;
  const pointTopIntensity = 2.1 * renderQuality.lightIntensityMultiplier;
  const shadowOpacity = renderQuality.enableShadows ? 0.3 : 0;
  const maxTextureSize = liteMode ? LITE_MAX_TEXTURE_SIZE : renderQuality.shadowMapSize * 2;

  const cleanupHandlers = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      cleanupHandlers.current?.();
    },
    []
  );

  return (
    <Canvas
      shadows={renderQuality.enableShadows && !liteMode}
      dpr={renderQuality.dpr}
      frameloop={liteMode ? "demand" : "always"}
      camera={{ position: [10, 0.5, 5], fov: 50, rotation: [0, 0.77, 0] }}
      style={{ width: "100%", height: "100vh", display: "block" }}
      gl={{
        antialias: renderQuality.enableShadows && !liteMode,
        alpha: false,
        powerPreference: liteMode ? "low-power" : "high-performance",
        preserveDrawingBuffer: false,
        stencil: false,
      }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        const handleLost = (event: WebGLContextEvent) => {
          event.preventDefault();
          onContextLost("WebGL context lost");
        };
        const handleRestored = () => {
          onContextRestored();
        };
        canvas.addEventListener("webglcontextlost", handleLost, false);
        canvas.addEventListener("webglcontextrestored", handleRestored, false);

        cleanupHandlers.current = () => {
          canvas.removeEventListener("webglcontextlost", handleLost, false);
          canvas.removeEventListener("webglcontextrestored", handleRestored, false);
        };

        if (liteMode) {
          THREE.Cache.enabled = false;
        }
      }}
    >
      <color attach="background" args={[canvasBg]} />
      {fogEnabled && <fog attach="fog" args={["#002200", 10, 40]} />}

      <FirstFrame onReady={onFirstFrame} />

      {liteMode && (
        <hemisphereLight
          skyColor="#5fff9e"
          groundColor="#0a1f10"
          intensity={0.85 * renderQuality.lightIntensityMultiplier}
        />
      )}
      <ambientLight intensity={ambientIntensity} color="#00ff1d" />
      <directionalLight
        position={[5, 5, 5]}
        intensity={directionalIntensity}
        color="#00ff1d"
        castShadow={renderQuality.enableShadows && !liteMode}
        shadow-mapSize-width={renderQuality.shadowMapSize}
        shadow-mapSize-height={renderQuality.shadowMapSize}
      />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.8 * renderQuality.lightIntensityMultiplier}
        color="#80ffcf"
      />
      <pointLight
        position={[0, -1, 0]}
        intensity={pointBottomIntensity}
        color="#00ff1d"
        distance={15}
      />
      <pointLight
        position={[0, 2, 0]}
        intensity={pointTopIntensity}
        distance={5}
        color="lime"
      />

      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="lime" transparent opacity={0.4} />
      </mesh>

      <Suspense fallback={null}>
        <RoomWithCat
          url="/models/stakan_room.glb"
          onLoaded={() => {}}
          screenTexture={screenTexture}
          liteMode={liteMode}
          maxTextureSize={maxTextureSize}
        />
        {!showLoader && renderQuality.enableEnvironment && !liteMode && (
          <Environment preset="forest" background />
        )}
      </Suspense>

      <mesh
        receiveShadow={renderQuality.enableShadows && !liteMode}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={shadowOpacity} />
      </mesh>

      {renderQuality.enablePostprocessing && !liteMode && (
        <EffectComposer>
          <Bloom
            intensity={0.4 * renderQuality.lightIntensityMultiplier}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <HueSaturation hue={0.3} saturation={0.5} />
        </EffectComposer>
      )}
    </Canvas>
  );
};

export default ModelScene;
