import { apiRequest } from "../../../lib/api";

export type Notice = {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getNoticeList(id?: number) {
  const query = typeof id === "number" ? `?id=${encodeURIComponent(id)}` : "";
  const data = await apiRequest<Notice[] | Notice>(`/api/v1/notice${query}`);
  return Array.isArray(data) ? data : [data];
}

export async function getPinnedNoticeList() {
  const data = await apiRequest<Notice[] | Notice>("/api/v1/notice/pinned");
  return Array.isArray(data) ? data : [data];
}
