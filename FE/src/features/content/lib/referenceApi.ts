import { apiRequest } from "../../../lib/api";

export interface ReferenceStatResponse {
  id: number;
  name: string;
  img: string;
  isLiked: boolean;
  createdAt: string;
  usedCount: number;
}

interface ToggleLikePayload {
  id: number;
  like: boolean;
}

export async function getReferenceList() {
  return apiRequest<ReferenceStatResponse[]>("/api/v1/reference");
}

export async function toggleReferenceLike(payload: ToggleLikePayload) {
  return apiRequest<Record<string, never>>("/api/v1/reference", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

