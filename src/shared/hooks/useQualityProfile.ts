import { useEffect, useMemo, useState } from "react";
import {
  getLiteModeReason,
  isLiteModeRequested,
  shouldUseLiteMode,
} from "../utils/platform";

export type QualityProfile = "lite" | "low" | "medium" | "high";

export interface QualityPreset {
  render: {
    dpr: [number, number];
    enableShadows: boolean;
    enablePostprocessing: boolean;
    enableEnvironment: boolean;
    enableFog: boolean;
    enableAntialias: boolean;
    lightIntensityMultiplier: number;
    shadowMapSize: number;
    maxTextureSize: number;
    maxParallelAssetRequests: number;
    powerPreference?: WebGLPowerPreference;
  };
  droplets: {
    spawnIntervalMultiplier: number;
    maxDrops: number;
    disableBombs: boolean;
    popDuration: number;
  };
  animation: {
    enableFrustumCulling: boolean;
  };
}

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    addEventListener?: (name: string, cb: () => void) => void;
    removeEventListener?: (name: string, cb: () => void) => void;
  };
};

const QUALITY_PRESETS: Record<QualityProfile, QualityPreset> = {
  high: {
    render: {
      dpr: [1, 2],
      enableShadows: true,
      enablePostprocessing: true,
      enableEnvironment: true,
      enableFog: true,
      enableAntialias: true,
      lightIntensityMultiplier: 1,
      shadowMapSize: 2048,
      maxTextureSize: 4096,
      maxParallelAssetRequests: 8,
      powerPreference: "high-performance",
    },
    droplets: {
      spawnIntervalMultiplier: 1,
      maxDrops: 48,
      disableBombs: false,
      popDuration: 600,
    },
    animation: {
      enableFrustumCulling: false,
    },
  },
  medium: {
    render: {
      dpr: [1, 1.5],
      enableShadows: true,
      enablePostprocessing: true,
      enableEnvironment: true,
      enableFog: true,
      enableAntialias: true,
      lightIntensityMultiplier: 0.9,
      shadowMapSize: 1024,
      maxTextureSize: 2048,
      maxParallelAssetRequests: 5,
    },
    droplets: {
      spawnIntervalMultiplier: 1.3,
      maxDrops: 36,
      disableBombs: false,
      popDuration: 520,
    },
    animation: {
      enableFrustumCulling: true,
    },
  },
  low: {
    render: {
      dpr: [0.75, 1],
      enableShadows: false,
      enablePostprocessing: false,
      enableEnvironment: false,
      enableFog: false,
      enableAntialias: false,
      lightIntensityMultiplier: 0.8,
      shadowMapSize: 512,
      maxTextureSize: 1024,
      maxParallelAssetRequests: 3,
      powerPreference: "low-power",
    },
    droplets: {
      spawnIntervalMultiplier: 1.8,
      maxDrops: 24,
      disableBombs: true,
      popDuration: 420,
    },
    animation: {
      enableFrustumCulling: true,
    },
  },
  lite: {
    render: {
      dpr: [1, 1],
      enableShadows: false,
      enablePostprocessing: false,
      enableEnvironment: false,
      enableFog: false,
      enableAntialias: false,
      lightIntensityMultiplier: 0.7,
      shadowMapSize: 256,
      maxTextureSize: 512,
      maxParallelAssetRequests: 2,
      powerPreference: "low-power",
    },
    droplets: {
      spawnIntervalMultiplier: 2,
      maxDrops: 16,
      disableBombs: true,
      popDuration: 360,
    },
    animation: {
      enableFrustumCulling: true,
    },
  },
};

const detectQualityProfile = (): QualityProfile => {
  if (typeof navigator === "undefined") return "high";

  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  const connectionType = nav.connection?.effectiveType ?? "";
  const userAgent = nav.userAgent?.toLowerCase?.() ?? "";
  const liteReason = getLiteModeReason();
  const liteRequested = isLiteModeRequested() || shouldUseLiteMode();

  if (liteRequested && liteReason) {
    console.info("[quality] force lite:", liteReason);
    return "lite";
  }
  if (liteRequested) return "lite";

  const isLegacyMobile = /android\s(7|8)|iphone\s(6|7|8)|mali-|redmi|sm-j|sm-a10/.test(
    userAgent
  );
  const isVeryLowCore = cores <= 2;
  const isLowCore = cores <= 4;
  const isVeryLowMemory = typeof memory === "number" && memory <= 2;
  const isLowMemory = typeof memory === "number" && memory <= 3;
  const isSlowConnection = connectionType === "slow-2g" || connectionType === "2g";
  const isModerateConnection = connectionType === "3g";

  if (
    isVeryLowCore ||
    isVeryLowMemory ||
    (isLowCore && isLowMemory) ||
    isLegacyMobile ||
    isSlowConnection
  ) {
    return "low";
  }

  if (isLowCore || isLowMemory || isModerateConnection) {
    return "medium";
  }

  return "high";
};

const useQualityProfile = () => {
  const [profile, setProfile] = useState<QualityProfile>(() => detectQualityProfile());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setProfile(detectQualityProfile());
    window.addEventListener("focus", handle);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("focus", handle);
      window.removeEventListener("resize", handle);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as NavigatorWithMemory;
    const connection = nav.connection;
    if (!connection || !connection.addEventListener) return;

    const handle = () => setProfile(detectQualityProfile());
    connection.addEventListener("change", handle);
    return () => connection.removeEventListener?.("change", handle);
  }, []);

  const settings = useMemo(() => QUALITY_PRESETS[profile], [profile]);

  return { profile, settings, isLiteMode: profile === "lite" };
};

export default useQualityProfile;
