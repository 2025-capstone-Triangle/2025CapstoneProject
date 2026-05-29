import { apiRequest } from "../../../lib/api";

export interface ContentPersonaDto {
  id: number;
  name: string;
  code: string;
}

export interface ContentReferenceDto {
  id: number;
  name: string;
  img: string;
}

export interface ContentStatResponse {
  id: number;
  persona: ContentPersonaDto;
  reference: ContentReferenceDto;
  img: string;
  type: string;
  description: string;
  createdAt: string;
  isLiked: boolean;
}

export type ContentType = "SQUARE" | "FEED" | "STORY";

export interface ContentCreateRequest {
  code: string;
  referenceId?: number;
  type: ContentType;
  sessionId?: string;
}

export interface ContentCreateResponse {
  id: number;
  reference?: ContentReferenceDto | null;
  img: string;
  type: ContentType;
}

export async function getContentListByPersonaCode(code: string) {
  const query = `?code=${encodeURIComponent(code)}`;
  return apiRequest<ContentStatResponse[]>(`/api/v1/content${query}`);
}

export async function createContent(payload: ContentCreateRequest) {
  if (typeof payload.referenceId === "number") {
    return apiRequest<ContentCreateResponse>("/api/v1/reference", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  const { referenceId: _referenceId, ...body } = payload;
  return apiRequest<ContentCreateResponse>("/api/v1/content", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface TrendContentCreateRequest {
  code: string;
  referenceId: number;
  type: ContentType;
}

export async function createTrendContent(payload: TrendContentCreateRequest) {
  return apiRequest<ContentCreateResponse>("/api/v1/reference", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleContentLike(id: number, like: boolean) {
  return apiRequest<Record<string, never>>("/api/v1/content", {
    method: "PATCH",
    body: JSON.stringify({ id, like }),
  });
}

export async function deleteContent(id: number) {
  return apiRequest<Record<string, never>>(`/api/v1/content/${id}`, {
    method: "DELETE",
  });
}

