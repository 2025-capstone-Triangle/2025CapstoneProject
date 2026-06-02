import { apiRequest } from "./api";

export const AUTH_STORAGE_KEY = "auth";

const PRIVATE_STORAGE_KEYS = [
  AUTH_STORAGE_KEY,
  "preferenceTestResult",
  "stagedDiagnosisPayload",
  "stagedDiagnosisVoiceMeta",
  "pendingPersonaCode",
  "pendingPersonaIsSelf",
  "personaFavoriteCodes",
  "app.diagnosis.latest-result",
  "app.diagnosis.last-page",
  "app.transient.state",
] as const;

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

export type SignInResponse = {
  accessToken: string;
  grantType: string;
  expiresIn: number;
};

export type AuthProfile = {
  username?: string;
  email?: string;
};

export type SavedAuth = SignInResponse & AuthProfile;

export type SignUpPayload = {
  username: string;
  password: string;
  email: string;
  birth: string;
  sex: "FEMALE" | "MALE" | "ETC";
  is_creator: boolean;
};

export type CheckPayload = {
  email?: string | null;
  username?: string | null;
};

export async function signIn(payload: {
  username: string;
  password: string;
}) {
  return apiRequest<SignInResponse>("/api/v1/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signUp(payload: SignUpPayload) {
  return apiRequest<null>("/api/v1/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkDuplicate(payload: CheckPayload) {
  return apiRequest<Record<string, boolean> | boolean>("/api/v1/check", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestEmailCode(email: string) {
  return apiRequest<Record<string, never>>("/api/v1/check-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCode(email: string, code: string) {
  return apiRequest<Record<string, never>>("/api/v1/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export type MemberInfo = {
  username: string;
  email: string;
  birth?: string | null;
  sex?: "FEMALE" | "MALE" | "ETC" | null;
  is_creator?: boolean | null;
};

export async function getMemberInfo() {
  return apiRequest<MemberInfo>("/api/v1/member");
}

export async function verifyMemberPassword(password: string) {
  return apiRequest<boolean>("/api/v1/member/check", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function updateMemberProfile(payload: {
  birth: string;
  sex: "FEMALE" | "MALE" | "ETC";
  is_creator: boolean;
}) {
  return apiRequest<Record<string, never>>("/api/v1/member", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateMemberEmail(email: string) {
  return apiRequest<Record<string, never>>("/api/v1/member/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function updateMemberPassword(password: string) {
  return apiRequest<Record<string, never>>("/api/v1/member/password", {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

export async function deleteMemberAccount() {
  return apiRequest<Record<string, never>>("/api/v1/member", {
    method: "DELETE",
  });
}

export async function signOut() {
  return apiRequest<Record<string, never>>("/api/v1/logout", {
    method: "POST",
  });
}

export function getSavedAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SavedAuth;
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

export function isAuthenticated() {
  const auth = getSavedAuth();
  return Boolean(auth?.accessToken);
}

export function saveAuth(data: SignInResponse, profile?: AuthProfile) {
  if (data.accessToken && isExpiredToken(data.accessToken)) {
    clearAuth();
    return;
  }

  const existing = getSavedAuth();
  const next: SavedAuth = {
    ...(existing ?? {}),
    ...data,
    ...(profile ?? {}),
  };
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
}

export function clearAuth() {
  PRIVATE_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}
