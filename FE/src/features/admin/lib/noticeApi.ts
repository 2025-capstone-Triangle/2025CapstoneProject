import { apiRequest } from "../../../lib/api";

export type AdminNotice = {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type NoticePayload = {
  title: string;
  content: string;
};

export async function getAdminNotices(id?: number) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  const data = await apiRequest<AdminNotice[] | AdminNotice>(
    `/api/v1/admin/notice${query}`
  );
  return Array.isArray(data) ? data : [data];
}

export async function createAdminNotice(payload: NoticePayload) {
  return apiRequest<Record<string, never>>("/api/v1/admin/notice", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminNotice(id: number, payload: NoticePayload) {
  return apiRequest<Record<string, never>>(`/api/v1/admin/notice/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminNotice(id: number) {
  return apiRequest<Record<string, never>>(`/api/v1/admin/notice/${id}`, {
    method: "DELETE",
  });
}
