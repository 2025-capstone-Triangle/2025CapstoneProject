import { apiRequest } from "../../../lib/api";

export type AdminReference = {
  id: number;
  name: string;
  img: string;
  description?: string | null;
  usedCount: number;
  createdAt: string;
};

export async function getAdminReferences(id?: number) {
  const query = typeof id === "number" ? `?id=${encodeURIComponent(id)}` : "";
  const data = await apiRequest<AdminReference[] | AdminReference>(
    `/api/v1/admin/reference${query}`
  );
  return Array.isArray(data) ? data : [data];
}

export async function createAdminReference(payload: {
  image: File;
  name: string;
  prompt: string;
  description?: string;
}) {
  const formData = new FormData();
  formData.append("image", payload.image);
  formData.append("name", payload.name);
  formData.append("prompt", payload.prompt);
  if (payload.description?.trim()) {
    formData.append("description", payload.description.trim());
  }

  return apiRequest<Record<string, never>>("/api/v1/admin/reference", {
    method: "POST",
    body: formData,
  });
}

export async function updateAdminReference(
  id: number,
  payload: {
    image?: File;
    name?: string;
    prompt?: string;
    description?: string;
  }
) {
  const formData = new FormData();
  if (payload.image) formData.append("image", payload.image);
  if (typeof payload.name === "string") formData.append("name", payload.name);
  if (typeof payload.prompt === "string") formData.append("prompt", payload.prompt);
  if (typeof payload.description === "string") formData.append("description", payload.description);

  return apiRequest<Record<string, never>>(`/api/v1/admin/reference/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export async function deleteAdminReference(id: number) {
  return apiRequest<Record<string, never>>(`/api/v1/admin/reference/${id}`, {
    method: "DELETE",
  });
}
