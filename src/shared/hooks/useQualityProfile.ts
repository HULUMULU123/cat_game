import { useEffect, useMemo, useState } from "react";

export type QualityProfile = "low" | "medium" | "high";

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

const isAndroidTelegramWebView = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent?.toLowerCase?.() ?? "";
  const isAndroid = ua.includes("android");
  const isTelegram = ua.includes("telegram") || ua.includes("tgapp");
  const isWebView = ua.includes("; wv") || ua.includes("version/") || ua.includes("webview");
  return isAndroid && (isTelegram || isWebView);
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

  if (isLiteQuery()) {
    return "low";
  }

  if (isAndroidTelegramWebView() && (isLowCore || isLowMemory || isLegacyMobile)) {
    return "low";
  }

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
  const [forcedReason, setForcedReason] = useState<string | null>(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMemoryPressure = () => {
      setForcedReason((prev) => prev ?? "memory-pressure");
      setProfile("low");
    };
    window.addEventListener("memorypressure" as any, handleMemoryPressure);
    return () => window.removeEventListener("memorypressure" as any, handleMemoryPressure);
  }, []);

  const forceLowProfile = (reason?: string) => {
    setForcedReason((prev) => prev ?? reason ?? null);
    setProfile("low");
  };

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

  return { profile, settings, forceLowProfile, forcedReason };
};

export default useQualityProfile;
