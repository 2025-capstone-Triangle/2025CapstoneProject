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

export async function getContentListByPersonaCode(code: string) {
  const query = `?code=${encodeURIComponent(code)}`;
  return apiRequest<ContentStatResponse[]>(`/api/v1/content${query}`);
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

