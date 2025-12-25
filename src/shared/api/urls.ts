const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const getWindowOrigin = (): string => {
  if (typeof window === "undefined") return "http://localhost";
  if (window.location.origin && window.location.origin !== "null") {
    return window.location.origin;
  }
  return "http://localhost";
};

export const getApiOrigin = (): string => {
  try {
    return new URL(API_BASE_URL, getWindowOrigin()).origin;
  } catch {
    return getWindowOrigin();
  }
};

const upgradeToApiOrigin = (url: string): string => {
  try {
    const api = new URL(getApiOrigin());
    const target = new URL(url);
    if (target.host === api.host && target.protocol !== api.protocol) {
      return `${api.protocol}//${target.host}${target.pathname}${target.search}${target.hash}`;
    }
  } catch {
    return url;
  }
  return url;
};

export const resolveMediaUrl = (raw?: string | null): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const apiOrigin = getApiOrigin();

  if (/^https?:\/\//i.test(trimmed)) {
    return upgradeToApiOrigin(trimmed);
  }
  if (trimmed.startsWith("//")) {
    try {
      return new URL(apiOrigin).protocol + trimmed;
    } catch {
      return "https:" + trimmed;
    }
  }

  if (trimmed.startsWith("/")) {
    return apiOrigin ? `${apiOrigin}${trimmed}` : trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, "");
  if (normalized.startsWith("media/")) {
    return apiOrigin ? `${apiOrigin}/${normalized}` : `/${normalized}`;
  }

  const stripped = normalized.replace(/^media\/?/, "");
  return apiOrigin ? `${apiOrigin}/media/${stripped}` : `/media/${stripped}`;
};
