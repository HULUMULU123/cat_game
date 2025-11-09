const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const inFlightRequests = new Map<string, Promise<unknown>>();

const serializeHeaders = (headers?: HeadersInit): string => {
  if (!headers) {
    return "";
  }

  const entries: [string, string][] = [];

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      entries.push([key, value]);
    });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      entries.push([key, String(value)]);
    });
  } else {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === "undefined") return;
      entries.push([key, String(value)]);
    });
  }

  entries.sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
};

const getRequestCacheKey = (path: string, options: RequestInit): string | null => {
  const method = (options.method ?? "GET").toUpperCase();
  const body = options.body;

  if (typeof body !== "undefined" && body !== null && typeof body !== "string") {
    return null;
  }

  const serializedHeaders = serializeHeaders(options.headers);
  const serializedBody = typeof body === "string" ? body : "";

  return `${method} ${path} ${serializedHeaders} ${serializedBody}`;
};

export const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const normalizedOptions: RequestInit = { ...options };
  const cacheKey = getRequestCacheKey(path, normalizedOptions);

  if (cacheKey) {
    const existing = inFlightRequests.get(cacheKey) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }
  }

  const fetchPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, normalizedOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  })();

  if (cacheKey) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    if (cacheKey) {
      inFlightRequests.delete(cacheKey);
    }
  }
};
