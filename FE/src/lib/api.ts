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
  if (status === 401) return "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";
  if (status === 403) return "\uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
  if (status === 404) return "\uC694\uCCAD\uD55C \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
  if (status >= 500) return "\uC11C\uBC84 \uCC98\uB9AC \uC911 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  return "\uC694\uCCAD\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC785\uB825\uAC12\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.";
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
      const message = "\uC11C\uBC84 \uC751\uB2F5\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
      raiseErrorToast(message);
      return undefined as T;
    }

    return (payload as ApiResponse<T>).data;
  } catch (error) {
    const apiError = error as ApiRequestError;
    if (!apiError?.__toastShown) {
      raiseErrorToast("\uC694\uCCAD \uCC98\uB9AC \uC911 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
    }
    throw error;
  }
}
