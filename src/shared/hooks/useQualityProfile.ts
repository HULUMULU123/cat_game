import { useEffect, useMemo, useState } from "react";
import { detectAndroidTelegramWebView } from "../utils/env";

export type QualityProfile = "low" | "medium" | "high";

export interface QualityPreset {
  render: {
    dpr: [number, number];
    enableShadows: boolean;
    enablePostprocessing: boolean;
    enableEnvironment: boolean;
    enableFog: boolean;
    lightIntensityMultiplier: number;
    shadowMapSize: number;
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

export interface QualityPresetOverrides {
  render?: Partial<QualityPreset["render"]>;
  droplets?: Partial<QualityPreset["droplets"]>;
  animation?: Partial<QualityPreset["animation"]>;
}

export interface UseQualityProfileOptions {
  forceProfile?: QualityProfile;
  preferLiteProfile?: boolean;
  overrides?: QualityPresetOverrides;
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
      lightIntensityMultiplier: 1,
      shadowMapSize: 2048,
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
      lightIntensityMultiplier: 0.9,
      shadowMapSize: 1024,
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
      lightIntensityMultiplier: 0.8,
      shadowMapSize: 512,
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
};

const detectQualityProfile = (): QualityProfile => {
  if (typeof navigator === "undefined") return "high";

  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  const connectionType = nav.connection?.effectiveType ?? "";
  const userAgent = nav.userAgent?.toLowerCase?.() ?? "";

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

const useQualityProfile = (options: UseQualityProfileOptions = {}) => {
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

  const isLiteDevice = options.preferLiteProfile ? detectAndroidTelegramWebView() : false;

  const targetProfile: QualityProfile =
    options.forceProfile ?? (isLiteDevice ? "low" : profile);

  const baseSettings = QUALITY_PRESETS[targetProfile];
  const overrides = options.overrides;

  const settings = useMemo<QualityPreset>(() => {
    const liteRenderOverride = isLiteDevice
      ? {
          dpr: [0.5, 0.75] as [number, number],
          enableShadows: false,
          enablePostprocessing: false,
          enableEnvironment: false,
          enableFog: false,
          lightIntensityMultiplier: 0.7,
          shadowMapSize: 512,
        }
      : {};

    return {
      render: { ...baseSettings.render, ...liteRenderOverride, ...overrides?.render },
      droplets: { ...baseSettings.droplets, ...overrides?.droplets },
      animation: { ...baseSettings.animation, ...overrides?.animation },
    };
  }, [baseSettings, isLiteDevice, overrides?.animation, overrides?.droplets, overrides?.render]);

  return { profile: targetProfile, settings, isLiteDevice };
};

export default useQualityProfile;
