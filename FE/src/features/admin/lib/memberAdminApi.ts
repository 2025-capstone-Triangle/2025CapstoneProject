import { apiRequest } from "../../../lib/api";

export type AdminMember = {
  id: number;
  username: string;
  email: string;
  role: string;
  birth: string;
  sex: "MALE" | "FEMALE" | "ETC";
  is_creator: boolean;
  createdAt: string;
  status: "ACTIVE" | "BANNED";
  block?: {
    reason?: string | null;
    blockedAt?: string | null;
    blockedBy?: string | null;
  } | null;
  lastLoginAt?: string | null;
};

export async function getAdminMembers(params?: { id?: number; isBlocked?: boolean }) {
  const queryParams = new URLSearchParams();
  if (typeof params?.id === "number") {
    queryParams.set("id", String(params.id));
  }
  if (typeof params?.isBlocked === "boolean") {
    queryParams.set("isBlocked", String(params.isBlocked));
  }
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const data = await apiRequest<AdminMember[] | AdminMember>(
    `/api/v1/admin/member${query}`
  );
  return Array.isArray(data) ? data : [data];
}

export async function updateAdminMemberStatus(payload: {
  id: number;
  status: "ACTIVE" | "BANNED";
  reason?: string;
}) {
  return apiRequest<Record<string, never>>("/api/v1/admin/member", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
