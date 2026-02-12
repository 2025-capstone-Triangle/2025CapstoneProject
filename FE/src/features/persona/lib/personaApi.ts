import { apiRequest } from "../../../lib/api";

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
  return apiRequest<PersonaResponse[]>("/api/v1/persona", {
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
  return apiRequest<PersonaResponse[]>("/api/v1/persona/save-new", {
    method: "PATCH",
    body: JSON.stringify({ code, name }),
  });
}

