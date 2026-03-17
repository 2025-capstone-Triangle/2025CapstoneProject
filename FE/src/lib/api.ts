const API_BASE_ENV = import.meta.env.VITE_API_BASE_URL?.trim();
const IS_HTTPS_PAGE = typeof window !== "undefined" && window.location.protocol === "https:";
const API_BASE =
  IS_HTTPS_PAGE && API_BASE_ENV?.startsWith("http://")
    ? ""
    : (API_BASE_ENV ?? "");

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

type ApiErrorResponse = {
  code?: string;
  status?: string;
  message?: string;
  data?: unknown;
};

const AUTH_STORAGE_KEY = "auth";

function getAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      accessToken: string;
      grantType?: string;
      expiresIn?: number;
    };
  } catch {
    return null;
  }
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;

  const base = API_BASE.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("accept", "application/json");

  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const auth = getAuth();
  if (auth?.accessToken) {
    const grantType = auth.grantType ?? "Bearer";
    headers.set("Authorization", `${grantType} ${auth.accessToken}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  const hasJsonBody = response.headers.get("content-type")?.includes("application/json");
  const payload = (hasJsonBody ? ((await response.json()) as ApiResponse<T> | ApiErrorResponse) : null);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    const error = new Error(errorPayload?.message || "Request failed");
    (error as Error & { code?: string }).code = errorPayload?.code ?? errorPayload?.status;
    throw error;
  }

  if (!payload) {
    return undefined as T;
  }

  return (payload as ApiResponse<T>).data;
}
