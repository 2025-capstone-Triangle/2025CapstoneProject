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
};

export async function getAdminMembers(id?: number) {
  const query = id ? `?id=${encodeURIComponent(id)}` : "";
  const data = await apiRequest<AdminMember[] | AdminMember>(
    `/api/v1/admin/member${query}`
  );
  return Array.isArray(data) ? data : [data];
}

export async function updateAdminMemberStatus(id: number, status: "ACTIVE" | "BANNED") {
  return apiRequest<Record<string, never>>("/api/v1/admin/member", {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
}
