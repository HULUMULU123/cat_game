import { useEffect, useMemo, useRef, useState } from "react";

export type QualityProfile = "low" | "medium" | "high";
export type QualityMode = "auto" | QualityProfile;

export interface QualityPreset {
  render: {
    dpr: number;
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
      dpr: 1.5,
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
      dpr: 1.2,
      enableShadows: true,
      enablePostprocessing: false,
      enableEnvironment: false,
      enableFog: false,
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
      dpr: 1,
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

const isLiteQuery = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("lite") === "1";
};

const QUALITY_MODE_STORAGE_KEY = "quality-mode";

const readStoredMode = (): QualityMode => {
  if (typeof window === "undefined") return "auto";
  const raw = window.localStorage.getItem(QUALITY_MODE_STORAGE_KEY);
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "auto") {
    return raw;
  }
  return "auto";
};

const detectQualityProfile = (): QualityProfile => {
  if (typeof navigator === "undefined") return "high";

  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  const connectionType = nav.connection?.effectiveType ?? "";
  const userAgent = nav.userAgent?.toLowerCase?.() ?? "";
  const isAndroid = userAgent.includes("android");
  const isVeryLowCore = cores <= 2;
  const isLowCore = cores <= 4;
  const isVeryLowMemory = typeof memory === "number" && memory <= 2;
  const isLowMemory = typeof memory === "number" && memory <= 3;
  const isSlowConnection = connectionType === "slow-2g" || connectionType === "2g";
  const isModerateConnection = connectionType === "3g";

  const isLowEndAndroid =
    isAndroid && isLowCore && (isLowMemory || typeof memory !== "number");

  if (isLiteQuery() || isLowEndAndroid) {
    return "low";
  }

  if (isVeryLowCore || isVeryLowMemory || (isLowCore && isLowMemory)) {
    return "low";
  }

  if (isLowCore || isLowMemory || isSlowConnection || isModerateConnection) {
    return "medium";
  }

  return "high";
};

const useQualityProfile = () => {
  const [qualityMode, setQualityMode] = useState<QualityMode>(() => readStoredMode());
  const [detectedProfile, setDetectedProfile] = useState<QualityProfile>(() =>
    detectQualityProfile()
  );
  const [forcedReason, setForcedReason] = useState<string | null>(null);
  const suppressPersistRef = useRef(false);
  const qualityModeRef = useRef<QualityMode>(qualityMode);

  const profile = qualityMode === "auto" ? detectedProfile : qualityMode;

  useEffect(() => {
    qualityModeRef.current = qualityMode;
  }, [qualityMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setDetectedProfile(detectQualityProfile());
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

    const handle = () => setDetectedProfile(detectQualityProfile());
    connection.addEventListener("change", handle);
    return () => connection.removeEventListener?.("change", handle);
  }, []);

  const forceLowProfile = (reason?: string) => {
    const currentMode = qualityModeRef.current;
    const canDowngrade =
      reason === "gpu-cap" ||
      (typeof document !== "undefined" && document.hidden);
    if (!canDowngrade) return;
    setForcedReason((prev) => prev ?? reason ?? null);
    setDetectedProfile("low");
    if (currentMode === "auto") return;
    suppressPersistRef.current = true;
    setQualityMode("low");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMemoryPressure = () => {
      forceLowProfile("memory-pressure");
    };
    window.addEventListener("memorypressure" as any, handleMemoryPressure);
    return () => window.removeEventListener("memorypressure" as any, handleMemoryPressure);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (suppressPersistRef.current) {
      suppressPersistRef.current = false;
      return;
    }
    window.localStorage.setItem(QUALITY_MODE_STORAGE_KEY, qualityMode);
  }, [qualityMode]);

  const settings = useMemo(() => {
    const preset = QUALITY_PRESETS[profile];
    const deviceDpr =
      typeof window === "undefined"
        ? preset.render.dpr
        : profile === "low"
        ? 1
        : Math.min(window.devicePixelRatio || 1.5, 2);

    return {
      ...preset,
      render: {
        ...preset.render,
        dpr: deviceDpr,
      },
    };
  }, [profile]);

  return {
    profile,
    settings,
    forceLowProfile,
    forcedReason,
    qualityMode,
    setQualityMode,
    detectedProfile,
  };
};

export default useQualityProfile;
