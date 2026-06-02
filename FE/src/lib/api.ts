import { clearAuth } from "./auth";
import { raiseErrorToast } from "./errorToastService";

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

type ApiRequestError = Error & {
  code?: string;
  __toastShown?: boolean;
};

const AUTH_STORAGE_KEY = "auth";

function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const base64 = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(base64)) as { exp?: number };
  } catch {
    return null;
  }
}

function isExpiredToken(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

function getAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      accessToken: string;
      grantType?: string;
      expiresIn?: number;
    };
    if (parsed.accessToken && isExpiredToken(parsed.accessToken)) {
      clearAuth();
      return null;
    }
    return parsed;
  } catch {
    clearAuth();
    return null;
  }
}

function buildApiUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function getPublicApiErrorMessage(status: number) {
  if (status === 401) return "로그인이 필요합니다.";
  if (status === 403) return "접근 권한이 없습니다.";
  if (status === 404) return "요청한 정보를 찾을 수 없습니다.";
  if (status >= 500) return "서버 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  return "요청을 처리하지 못했습니다. 입력값을 확인해 주세요.";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
    });

    const hasJsonBody = response.headers.get("content-type")?.includes("application/json");
    const payload = hasJsonBody
      ? ((await response.json()) as ApiResponse<T> | ApiErrorResponse)
      : null;

    if (!response.ok) {
      const errorPayload = payload as ApiErrorResponse | null;
      const message = getPublicApiErrorMessage(response.status);
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }

      raiseErrorToast(message);

      const error = new Error(message) as ApiRequestError;
      error.code = errorPayload?.code ?? errorPayload?.status;
      error.__toastShown = true;
      throw error;
    }

    if (!payload) {
      const message = "서버 응답을 처리하지 못했습니다.";
      raiseErrorToast(message);
      return undefined as T;
    }

    return (payload as ApiResponse<T>).data;
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (!apiError?.__toastShown) {
      raiseErrorToast("요청 처리 중 문제가 발생했습니다.");
    }
    throw error;
  }
}