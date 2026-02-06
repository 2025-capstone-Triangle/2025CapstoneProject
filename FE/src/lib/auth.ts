import { apiRequest } from "./api";

export const AUTH_STORAGE_KEY = "auth";

export type SignInResponse = {
  accessToken: string;
  grantType: string;
  expiresIn: number;
};

export type SignUpPayload = {
  username: string;
  password: string;
  email: string;
  birth: string;
  sex: "FEMALE" | "MALE";
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

export function saveAuth(data: SignInResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
