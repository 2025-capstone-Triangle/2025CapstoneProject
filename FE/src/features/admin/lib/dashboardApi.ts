import { apiRequest } from "../../../lib/api";

export type DashboardPeriodType = "DAILY" | "WEEKLY" | "MONTHLY";

export type DashboardStatPoint = {
  targetDate: string;
  count: number;
};

export type AdminDashboardStatus = {
  visitorStats: DashboardStatPoint[];
  registrationStats: DashboardStatPoint[];
  withdrawalStats: DashboardStatPoint[];
  analyzedStats: DashboardStatPoint[];
  contentCreationStats: DashboardStatPoint[];
};

export async function getAdminDashboardStatus(params?: {
  date?: string;
  periodType?: DashboardPeriodType;
}) {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.set("date", params.date);
  queryParams.set("periodType", params?.periodType ?? "DAILY");
  const query = queryParams.toString();
  return apiRequest<AdminDashboardStatus>(`/api/v1/admin/dashboard/status?${query}`);
}
