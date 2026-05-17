import { apiRequest } from "../../../lib/api";

const DIAGNOSE_API_URL =
  import.meta.env.VITE_DIAGNOSE_API_URL?.trim() || "https://13.209.17.191.nip.io/api/v1/persona";

export interface PersonaResponse {
  id: number;
  name: string;
  profile: string;
  keywords: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  code: string;
  thumbnail?: string | null;
  summary?: string | null;
  traits?: string | null;
}

export async function getPersonaList(code?: string) {
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  const data = await apiRequest<PersonaResponse[] | PersonaResponse>(`/api/v1/persona${query}`);
  return Array.isArray(data) ? data : [data];
}

export async function saveSharedPersona(code: string, name: string) {
  return apiRequest<Record<string, never>>("/api/v1/persona/save-share", {
    method: "PATCH",
    body: JSON.stringify({ code, name }),
  });
}

export async function renamePersona(code: string, name: string) {
  return apiRequest<Record<string, never>>("/api/v1/persona", {
    method: "PATCH",
    body: JSON.stringify({ code, name }),
  });
}

export async function removePersona(code: string) {
  const query = `?code=${encodeURIComponent(code)}`;
  return apiRequest<Record<string, never>>(`/api/v1/persona${query}`, {
    method: "DELETE",
  });
}

export async function saveNewPersona(code: string, name: string) {
  return apiRequest<Record<string, never>>("/api/v1/persona/save-new", {
    method: "PATCH",
    body: JSON.stringify({ code, name }),
  });
}

export async function diagnosePersona(payload: {
  profile: File;
  image: File;
  voice: File;
  answer: {
    q1_environment: number;
    q2_style: number;
    q3_minimal_maximal: number;
    q4_mood: number;
    q5_contrast_type: number;
    q6_motion: number;
    q7_framing: number;
  };
  q8_tone: number[];
  sessionId?: string;
  callbackUrl?: string;
}) {
  const formData = new FormData();
  formData.append("profile", payload.profile);
  formData.append("image", payload.image);
  formData.append("voice", payload.voice);
  formData.append("answer", JSON.stringify(payload.answer));
  formData.append(
    "preferenceType",
    JSON.stringify({
      answer: payload.answer,
      q8_tone: payload.q8_tone,
    }),
  );
  payload.q8_tone.forEach((toneValue) => {
    formData.append("q8_tone", String(toneValue));
  });
  if (payload.sessionId) {
    formData.append("sessionId", payload.sessionId);
    formData.append("session_id", payload.sessionId);
  }
  if (payload.callbackUrl) {
    formData.append("callback_url", payload.callbackUrl);
  }

  return apiRequest<PersonaResponse>(DIAGNOSE_API_URL, {
    method: "POST",
    body: formData,
  });
}
