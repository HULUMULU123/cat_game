const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

// (опционально) дедуп одинаковых одновременных запросов
const inflight = new Map<string, Promise<Response>>();

export const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = joinUrl(API_BASE_URL, path);
  const key = `${(options.method || "GET").toUpperCase()} ${url}`;

  if (inflight.has(key)) {
    const res = await inflight.get(key)!;
    return handleResponse<T>(res);
  }

  const p = fetch(url, options).finally(() => inflight.delete(key));
  inflight.set(key, p);

  const res = await p;
  return handleResponse<T>(res);
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new ApiError(response.status, errorText || response.statusText);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
