const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "http://ec2-13-209-98-117.ap-northeast-2.compute.amazonaws.com:8080";

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const auth = getAuth();
  if (auth?.accessToken) {
    const grantType = auth.grantType ?? "Bearer";
    headers.set("Authorization", `${grantType} ${auth.accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed");
    (error as Error & { code?: string }).code = payload?.code;
    throw error;
  }

  return payload.data;
}
