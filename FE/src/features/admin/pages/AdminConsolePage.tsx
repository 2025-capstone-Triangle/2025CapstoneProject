import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import {
  getAdminDashboardStatus,
  type AdminDashboardStatus,
  type DashboardPeriodType,
  type DashboardStatPoint,
} from "../lib/dashboardApi";
import { getAdminMembers, updateAdminMemberStatus, type AdminMember } from "../lib/memberAdminApi";
import { createAdminNotice, deleteAdminNotice, getAdminNotices, updateAdminNotice, type AdminNotice } from "../lib/noticeApi";
import {
  createAdminReference,
  deleteAdminReference,
  getAdminReferences,
  updateAdminReference,
  type AdminReference,
} from "../lib/referenceAdminApi";
import { validateImageUploadFile } from "../../../shared/lib/fileSecurity";

type SectionId = "dashboard" | "users" | "blocked" | "notices" | "references";
type UserStatus = "ACTIVE" | "BANNED";

type AdminConsolePageProps = {
  adminId?: string;
  onLogout: () => void;
  onBackHome?: () => void;
};

type MemberView = {
  id: number;
  username: string;
  email: string;
  role: string;
  birth: string;
  sex: "MALE" | "FEMALE" | "ETC";
  createdAt: string;
  status: "ACTIVE" | "BANNED";
  blockReason: string;
  blockedAt: string | null;
};

const NAV_ITEMS: Array<{ id: SectionId; label: string; description: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "대시보드", description: "서비스 현황", icon: LayoutDashboard },
  { id: "users", label: "회원 관리", description: "전체 회원", icon: Users },
  { id: "blocked", label: "차단 회원", description: "제재 관리", icon: UserX },
  { id: "notices", label: "공지 관리", description: "공지 CRUD", icon: Megaphone },
  { id: "references", label: "레퍼런스", description: "트렌드 콘텐츠", icon: Sparkles },
];

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDailyLabels(baseDate: string) {
  const [year, month, day] = baseDate.split("-").map(Number);
  const end = new Date(year, month - 1, day);
  const labels: string[] = [];
  for (let diff = 6; diff >= 0; diff -= 1) {
    const current = new Date(end);
    current.setDate(end.getDate() - diff);
    labels.push(formatLocalDate(current));
  }
  return labels;
}

function formatChartLabel(label: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label.slice(5);
  return label;
}

function mapMember(dto: AdminMember): MemberView {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    role: dto.role,
    birth: dto.birth,
    sex: dto.sex,
    createdAt: dto.createdAt,
    status: dto.status,
    blockReason: dto.block?.reason ?? "",
    blockedAt: dto.block?.blockedAt ?? null,
  };
}

function sumStat(points: DashboardStatPoint[]) {
  return points.reduce((sum, point) => sum + (point.count ?? 0), 0);
}

function latestStat(points: DashboardStatPoint[]) {
  return points.length ? points[points.length - 1] : null;
}

function Pill({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition",
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
      )}
    >
      {children}
    </button>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/50 bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-['NEXON_Football_Gothic'] text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50">
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function getTrend(points: DashboardStatPoint[]) {
  const last = points[points.length - 1]?.count ?? 0;
  const prev = points[points.length - 2]?.count ?? null;
  if (prev === null) return { label: "비교 데이터 없음", tone: "flat" as const };
  const diff = last - prev;
  if (diff === 0) return { label: "전 구간 대비 변동 없음", tone: "flat" as const };
  if (prev === 0) return { label: `${diff > 0 ? "+" : "-"}${Math.abs(diff).toLocaleString()} (절대 변화)`, tone: diff > 0 ? ("up" as const) : ("down" as const) };
  const rate = Math.abs((diff / prev) * 100);
  return {
    label: `${diff > 0 ? "+" : "-"}${rate.toFixed(1)}% (${Math.abs(diff).toLocaleString()})`,
    tone: diff > 0 ? ("up" as const) : ("down" as const),
  };
}

function BarChartMini({
  points,
  color,
  showLabels = false,
  compact = false,
}: {
  points: DashboardStatPoint[];
  color: string;
  showLabels?: boolean;
  compact?: boolean;
}) {
  if (!points.length) return <div className="h-16 rounded-md bg-slate-50" />;
  const max = Math.max(...points.map((point) => point.count), 1);
  const view = points;
  return (
    <div className={cn("overflow-x-auto rounded-md bg-slate-50 p-2", compact && "h-16")}>
      <div className={cn("mx-auto flex min-w-max items-end justify-center gap-2.5", compact && "gap-2")}>
      {view.map((point) => (
        <div key={point.targetDate} className={cn("flex flex-col items-center gap-1", compact ? "w-6" : "w-8")}>
          <div className={cn("relative flex items-end", compact ? "h-10 w-6" : "h-14 w-8")}>
            <div
              className="w-full rounded-sm"
              style={{
                height: `${Math.max(8, (point.count / max) * 100)}%`,
                backgroundColor: color,
              }}
            />
            <span
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[9px] font-semibold text-slate-700"
              style={{ bottom: `calc(${Math.max(8, (point.count / max) * 100)}% + 2px)` }}
            >
              {point.count.toLocaleString()}
            </span>
          </div>
          {showLabels ? <span className="text-[10px] text-slate-500">{formatChartLabel(point.targetDate)}</span> : null}
        </div>
      ))}
      </div>
    </div>
  );
}

type DashboardSeries = {
  key: string;
  label: string;
  color: string;
  points: DashboardStatPoint[];
};

function MetricCard({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Users }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.14em] text-slate-500">{title}</p>
        <span className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </article>
  );
}

export function AdminConsolePage({ adminId = "admin", onLogout, onBackHome }: AdminConsolePageProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriodType>("DAILY");
  const [dashboardDate, setDashboardDate] = useState(getTodayLocalDate);
  const [dashboardAppliedDate, setDashboardAppliedDate] = useState(getTodayLocalDate);
  const [dashboardDetailKey, setDashboardDetailKey] = useState("visitors");

  const [members, setMembers] = useState<MemberView[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeQuery, setNoticeQuery] = useState("");
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    id: null as number | null,
    title: "",
    content: "",
    isPinned: false,
    isDraft: false,
  });

  const [references, setReferences] = useState<AdminReference[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceFormOpen, setReferenceFormOpen] = useState(false);
  const [referenceForm, setReferenceForm] = useState({
    id: null as number | null,
    name: "",
    prompt: "",
    description: "",
    image: null as File | null,
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardStatus>({
    visitorStats: [],
    registrationStats: [],
    withdrawalStats: [],
    analyzedStats: [],
    contentCreationStats: [],
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const data = await getAdminMembers();
      setMembers(data.map(mapMember));
    } catch {
      setToast("회원 목록을 불러오지 못했습니다.");
    } finally {
      setMembersLoading(false);
    }
  };

  const loadNotices = async () => {
    setNoticeLoading(true);
    try {
      setNotices(await getAdminNotices());
    } catch {
      setToast("공지 목록을 불러오지 못했습니다.");
    } finally {
      setNoticeLoading(false);
    }
  };

  const loadReferences = async () => {
    setReferenceLoading(true);
    try {
      setReferences(await getAdminReferences());
    } catch {
      setToast("레퍼런스 목록을 불러오지 못했습니다.");
    } finally {
      setReferenceLoading(false);
    }
  };

  const loadDashboard = async (options?: { date?: string }) => {
    setDashboardLoading(true);
    const resolvedDate = options?.date ?? getTodayLocalDate();
    setDashboardAppliedDate(resolvedDate);
    try {
      const data = await getAdminDashboardStatus({
        date: options?.date ?? undefined,
        periodType: dashboardPeriod,
      });
      setDashboard(data);
    } catch {
      setDashboard({
        visitorStats: [],
        registrationStats: [],
        withdrawalStats: [],
        analyzedStats: [],
        contentCreationStats: [],
      });
      setToast("대시보드 지표를 불러오지 못했습니다.");
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
    void loadNotices();
    void loadReferences();
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [dashboardPeriod]);

  const filteredMembers = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return members.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!lowered) return true;
      return item.username.toLowerCase().includes(lowered) || item.email.toLowerCase().includes(lowered) || String(item.id).includes(lowered);
    });
  }, [members, query, statusFilter]);
  const filteredNotices = useMemo(() => {
    const lowered = noticeQuery.trim().toLowerCase();
    if (!lowered) return notices;
    return notices.filter((item) => {
      return item.title.toLowerCase().includes(lowered) || item.content.toLowerCase().includes(lowered) || String(item.id).includes(lowered);
    });
  }, [notices, noticeQuery]);
  const filteredReferences = useMemo(() => {
    const lowered = referenceQuery.trim().toLowerCase();
    if (!lowered) return references;
    return references.filter((item) => {
      return item.name.toLowerCase().includes(lowered) || (item.description ?? "").toLowerCase().includes(lowered) || String(item.id).includes(lowered);
    });
  }, [references, referenceQuery]);

  const blockedMembers = useMemo(() => members.filter((item) => item.status === "BANNED"), [members]);
  const userRows = filteredMembers;
  const noticeRows = filteredNotices;
  const referenceRows = filteredReferences;

  const summary = useMemo(
    () => ({
      total: members.length,
      active: members.filter((item) => item.status === "ACTIVE").length,
      banned: members.filter((item) => item.status === "BANNED").length,
    }),
    [members],
  );

  const toggleMemberStatus = async (id: number) => {
    const target = members.find((item) => item.id === id);
    if (!target) return;

    const nextStatus: UserStatus = target.status === "BANNED" ? "ACTIVE" : "BANNED";
    const reason =
      nextStatus === "BANNED"
        ? window.prompt("차단 사유를 입력하세요.", target.blockReason || "운영 정책 위반") || ""
        : "";

    try {
      await updateAdminMemberStatus({ id, status: nextStatus, reason });
      await loadMembers();
      setToast(nextStatus === "BANNED" ? "회원을 차단했습니다." : "차단을 해제했습니다.");
    } catch {
      setToast("회원 상태 변경에 실패했습니다.");
    }
  };

  const saveNotice = async () => {
    const payload = {
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      isPinned: noticeForm.isPinned,
      isDraft: noticeForm.isDraft,
    };

    if (!payload.title || !payload.content) {
      setToast("공지 제목과 내용을 입력해주세요.");
      return;
    }

    try {
      if (noticeForm.id == null) {
        await createAdminNotice(payload);
      } else {
        await updateAdminNotice(noticeForm.id, payload);
      }
      await loadNotices();
      setNoticeFormOpen(false);
      setToast("공지사항이 저장되었습니다.");
    } catch {
      setToast("공지사항 저장에 실패했습니다.");
    }
  };

  const removeNotice = async (id: number) => {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminNotice(id);
      await loadNotices();
      setToast("공지사항을 삭제했습니다.");
    } catch {
      setToast("공지사항 삭제에 실패했습니다.");
    }
  };

  const saveReference = async () => {
    if (!referenceForm.name.trim()) {
      setToast("레퍼런스 이름을 입력해주세요.");
      return;
    }

    try {
      if (referenceForm.id == null) {
        if (!referenceForm.image || !referenceForm.prompt.trim()) {
          setToast("신규 생성은 이미지와 프롬프트가 필수입니다.");
          return;
        }
        await createAdminReference({
          image: referenceForm.image,
          name: referenceForm.name.trim(),
          prompt: referenceForm.prompt.trim(),
          description: referenceForm.description.trim(),
        });
      } else {
        await updateAdminReference(referenceForm.id, {
          image: referenceForm.image ?? undefined,
          name: referenceForm.name.trim(),
          prompt: referenceForm.prompt.trim() || undefined,
          description: referenceForm.description.trim(),
        });
      }

      await loadReferences();
      setReferenceFormOpen(false);
      setToast("레퍼런스를 저장했습니다.");
    } catch {
      setToast("레퍼런스 저장에 실패했습니다.");
    }
  };

  const removeReference = async (id: number) => {
    if (!window.confirm("이 레퍼런스를 삭제하시겠습니까?")) return;
    try {
      await deleteAdminReference(id);
      await loadReferences();
      setToast("레퍼런스를 삭제했습니다.");
    } catch {
      setToast("레퍼런스 삭제에 실패했습니다.");
    }
  };

  const openNoticeCreate = () => {
    setNoticeForm({ id: null, title: "", content: "", isPinned: false, isDraft: false });
    setNoticeFormOpen(true);
  };

  const openNoticeEdit = (item: AdminNotice) => {
    setNoticeForm({
      id: item.id,
      title: item.title,
      content: item.content,
      isPinned: item.isPinned,
      isDraft: item.isDraft,
    });
    setNoticeFormOpen(true);
  };

  const openReferenceCreate = () => {
    setReferenceForm({ id: null, name: "", prompt: "", description: "", image: null });
    setReferenceFormOpen(true);
  };

  const openReferenceEdit = (item: AdminReference) => {
    setReferenceForm({ id: item.id, name: item.name, prompt: "", description: item.description ?? "", image: null });
    setReferenceFormOpen(true);
  };

  const handleReferenceImageChange = (file?: File) => {
    if (!file) {
      setReferenceForm((prev) => ({ ...prev, image: null }));
      return;
    }

    const validationMessage = validateImageUploadFile(file);
    if (validationMessage) {
      setToast(validationMessage);
      setReferenceForm((prev) => ({ ...prev, image: null }));
      return;
    }

    setReferenceForm((prev) => ({ ...prev, image: file }));
  };

  const activeSectionMeta = NAV_ITEMS.find((item) => item.id === activeSection);
  const visitorTotal = sumStat(dashboard.visitorStats);
  const registrationTotal = sumStat(dashboard.registrationStats);
  const withdrawalTotal = sumStat(dashboard.withdrawalStats);
  const analyzedTotal = sumStat(dashboard.analyzedStats);
  const contentCreationTotal = sumStat(dashboard.contentCreationStats);
  const latestVisitor = latestStat(dashboard.visitorStats);
  const dashboardSeries = useMemo<DashboardSeries[]>(
    () => [
      { key: "visitors", label: "방문자", color: "#0f172a", points: dashboard.visitorStats },
      { key: "registration", label: "가입", color: "#2563eb", points: dashboard.registrationStats },
      { key: "withdrawal", label: "탈퇴", color: "#dc2626", points: dashboard.withdrawalStats },
      { key: "analyzed", label: "진단", color: "#7c3aed", points: dashboard.analyzedStats },
      { key: "content", label: "콘텐츠 생성", color: "#0d9488", points: dashboard.contentCreationStats },
    ],
    [dashboard],
  );
  const normalizedDashboardSeries = useMemo(() => {
    let labels: string[];
    if (dashboardPeriod === "DAILY") {
      labels = buildDailyLabels(dashboardAppliedDate);
    } else {
      const merged = new Set<string>();
      dashboardSeries.forEach((series) => {
        series.points.forEach((point) => merged.add(point.targetDate));
      });
      labels = Array.from(merged);
    }

    return dashboardSeries.map((series) => {
      const map = new Map(series.points.map((point) => [point.targetDate, point.count]));
      return {
        ...series,
        points: labels.map((label) => ({
          targetDate: label,
          count: map.get(label) ?? 0,
        })),
      };
    });
  }, [dashboardAppliedDate, dashboardPeriod, dashboardSeries]);
  const selectedDashboardSeries = normalizedDashboardSeries.find((series) => series.key === dashboardDetailKey) ?? normalizedDashboardSeries[0];
  const conversionRate = visitorTotal > 0 ? (registrationTotal / visitorTotal) * 100 : 0;
  const analysisRate = registrationTotal > 0 ? (analyzedTotal / registrationTotal) * 100 : 0;
  const retentionRate = registrationTotal > 0 ? ((registrationTotal - withdrawalTotal) / registrationTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f7ff] via-[#f8fbff] to-[#eef2ff] p-4 text-slate-900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:p-8">
      <aside className="mb-4 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur lg:mb-0">
        <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-xs tracking-[0.16em] text-slate-500">PERSON:A ADMIN</p>
          <p className="mt-1 text-lg font-bold">운영 콘솔</p>
          <p className="mt-2 text-xs text-slate-500">관리자: {adminId}</p>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  active ? "bg-slate-900 text-white shadow" : "text-slate-700 hover:bg-white",
                )}
              >
                <span className={cn("rounded-lg p-2", active ? "bg-white/20" : "bg-slate-100")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={cn("text-[11px]", active ? "text-slate-200" : "text-slate-500")}>{item.description}</p>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="space-y-4">
        <header className="rounded-3xl border border-white/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-slate-500">ADMIN PANEL</p>
              <h1 className="mt-1 font-['NEXON_Football_Gothic'] text-2xl text-slate-900">{activeSectionMeta?.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              {onBackHome ? (
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={onBackHome}
                >
                  홈으로
                </button>
              ) : null}
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={onLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {activeSection === "dashboard" ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.16em] text-slate-200">SERVICE STATUS</p>
                  <h2 className="mt-1 text-xl font-semibold">운영 지표 대시보드</h2>
                  <p className="mt-2 text-xs text-slate-300">
                    최신 방문자: {latestVisitor ? `${latestVisitor.targetDate} · ${latestVisitor.count.toLocaleString()}명` : "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-100">
                  <div className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    기본 조회: 오늘 기준
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-2">
                <div>
                  <p className="mb-1 text-[11px] text-slate-300">기간 타입</p>
                  <select
                    value={dashboardPeriod}
                    onChange={(e) => setDashboardPeriod(e.target.value as DashboardPeriodType)}
                    className="h-10 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none"
                  >
                    <option className="text-slate-900" value="DAILY">
                      DAILY
                    </option>
                    <option className="text-slate-900" value="WEEKLY">
                      WEEKLY
                    </option>
                    <option className="text-slate-900" value="MONTHLY">
                      MONTHLY
                    </option>
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-slate-300">지정 날짜</p>
                  <input
                    type="date"
                    value={dashboardDate}
                    onChange={(e) => setDashboardDate(e.target.value)}
                    className="h-10 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none"
                  />
                </div>
                <button
                  className="h-10 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900"
                  onClick={() => void loadDashboard({ date: dashboardDate })}
                >
                  지정 날짜 조회
                </button>
                <button
                  className="h-10 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white"
                  onClick={() => {
                    const today = getTodayLocalDate();
                    setDashboardDate(today);
                    void loadDashboard();
                  }}
                >
                  오늘 기준 복귀
                </button>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard title="방문자 합계" value={visitorTotal} icon={Users} />
              <MetricCard title="가입 합계" value={registrationTotal} icon={CheckCircle2} />
              <MetricCard title="탈퇴 합계" value={withdrawalTotal} icon={UserX} />
              <MetricCard title="진단 합계" value={analyzedTotal} icon={Sparkles} />
              <MetricCard title="콘텐츠 생성 합계" value={contentCreationTotal} icon={ImagePlus} />
            </div>

            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                지표별 추이
              </h2>
              {dashboardLoading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  집계 데이터 불러오는 중
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {normalizedDashboardSeries.map((series) => {
                    const trend = getTrend(series.points);
                    return (
                      <div key={series.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">{series.label}</p>
                          <span className="text-xs font-semibold text-slate-600">{sumStat(series.points).toLocaleString()}</span>
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-[11px] font-medium",
                            trend.tone === "up" && "text-emerald-600",
                            trend.tone === "down" && "text-rose-600",
                            trend.tone === "flat" && "text-slate-500",
                          )}
                        >
                          {trend.label}
                        </p>
                        <div className="mt-2 rounded-md bg-white p-2">
                          <BarChartMini points={series.points} color={series.color} showLabels />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">핵심 비율</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-500">방문 대비 가입 전환율</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-500">가입 대비 진단 완료율</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{analysisRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-500">가입 유지율</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{retentionRate.toFixed(1)}%</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">지표 상세표</h3>
                <div className="flex flex-wrap gap-1.5">
                  {normalizedDashboardSeries.map((series) => (
                    <button
                      key={series.key}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px]",
                        dashboardDetailKey === series.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600",
                      )}
                      onClick={() => setDashboardDetailKey(series.key)}
                    >
                      {series.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[620px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="px-3 py-2 text-left">구간</th>
                      <th className="px-3 py-2 text-right">수치</th>
                      <th className="px-3 py-2 text-right">전 구간 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedDashboardSeries?.points ?? []).map((row, index, arr) => {
                      const prev = index > 0 ? arr[index - 1].count : null;
                      const diff = prev === null ? null : row.count - prev;
                      return (
                        <tr key={row.targetDate} className="border-b border-slate-100">
                          <td className="px-3 py-2 text-slate-700">{row.targetDate}</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-900">{row.count.toLocaleString()}</td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right text-xs font-medium",
                              diff === null && "text-slate-400",
                              (diff ?? 0) > 0 && "text-emerald-600",
                              (diff ?? 0) < 0 && "text-rose-600",
                              diff === 0 && "text-slate-500",
                            )}
                          >
                            {diff === null ? "-" : `${diff > 0 ? "+" : ""}${diff.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })}
                    {!dashboardLoading && (selectedDashboardSeries?.points.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-2 py-6 text-center text-slate-500">
                          표시할 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {activeSection === "users" ? (
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm"
                  placeholder="이름/이메일/ID 검색"
                />
              </div>
              {(["all", "ACTIVE", "BANNED"] as const).map((item) => (
                <Pill key={item} active={statusFilter === item} onClick={() => setStatusFilter(item)}>
                  {item}
                </Pill>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-md bg-slate-100 px-2 py-1">전체 {summary.total}</span>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">활성 {summary.active}</span>
              <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">차단 {summary.banned}</span>
            </div>

            <div className="space-y-2">
              {membersLoading ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-4 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중
                </div>
              ) : null}

              {!membersLoading && userRows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">검색 결과가 없습니다.</p>
              ) : null}

              {userRows.map((member) => (
                <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{member.username}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                    <p className="mt-1 text-[11px] text-slate-400">가입일 {formatDateTime(member.createdAt)}</p>
                  </div>
                  <button
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-medium",
                      member.status === "BANNED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
                    )}
                    onClick={() => void toggleMemberStatus(member.id)}
                  >
                    {member.status === "BANNED" ? "차단 해제" : "차단"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === "blocked" ? (
          <section className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            {blockedMembers.map((item) => (
              <article key={item.id} className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.username}</p>
                  <button className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700" onClick={() => void toggleMemberStatus(item.id)}>
                    차단 해제
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                <p className="mt-2 text-xs text-slate-600">사유: {item.blockReason || "사유 미입력"}</p>
                <p className="text-xs text-slate-500">차단일: {formatDateTime(item.blockedAt)}</p>
              </article>
            ))}
            {blockedMembers.length === 0 ? <p className="text-sm text-slate-500">현재 차단된 회원이 없습니다.</p> : null}
          </section>
        ) : null}

        {activeSection === "notices" ? (
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={noticeQuery}
                  onChange={(e) => setNoticeQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm"
                  placeholder="공지 제목/내용/ID 검색"
                />
              </div>
              <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white" onClick={openNoticeCreate}>
                <Plus className="h-3.5 w-3.5" /> 공지 추가
              </button>
            </div>

            {noticeLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중
              </div>
            ) : null}

            {!noticeLoading && noticeRows.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">등록된 공지가 없습니다.</p>
            ) : null}

            {noticeRows.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.isPinned ? <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] text-rose-700">고정</span> : null}
                  {item.isDraft ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">임시저장</span> : null}
                </div>
                <p className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{item.content}</p>
                <p className="mt-2 text-[11px] text-slate-400">수정일 {formatDateTime(item.updatedAt)}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs" onClick={() => openNoticeEdit(item)}>
                    <Pencil className="h-3 w-3" /> 수정
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700" onClick={() => void removeNotice(item.id)}>
                    <Trash2 className="h-3 w-3" /> 삭제
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {activeSection === "references" ? (
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={referenceQuery}
                  onChange={(e) => setReferenceQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm"
                  placeholder="레퍼런스 이름/설명/ID 검색"
                />
              </div>
              <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white" onClick={openReferenceCreate}>
                <ImagePlus className="h-3.5 w-3.5" /> 레퍼런스 추가
              </button>
            </div>

            {referenceLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중
              </div>
            ) : null}

            <div className="grid gap-2 md:grid-cols-2">
              {referenceRows.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-slate-100">
                  <div className="aspect-[16/9] bg-slate-100">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">이미지 없음</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description || "설명 없음"}</p>
                    <p className="mt-1 text-[11px] text-slate-400">사용 수 {item.usedCount.toLocaleString()}</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs" onClick={() => openReferenceEdit(item)}>
                        <Pencil className="h-3 w-3" /> 수정
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700" onClick={() => void removeReference(item.id)}>
                        <Trash2 className="h-3 w-3" /> 삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!referenceLoading && referenceRows.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">등록된 레퍼런스가 없습니다.</p>
            ) : null}
          </section>
        ) : null}
      </main>

      {toast ? (
        <div className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          <BellRing className="h-3.5 w-3.5" />
          {toast}
        </div>
      ) : null}

      {noticeFormOpen ? (
        <Modal title={noticeForm.id == null ? "공지 작성" : "공지 수정"} onClose={() => setNoticeFormOpen(false)}>
          <div className="space-y-2">
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="제목"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={5}
              placeholder="내용"
              value={noticeForm.content}
              onChange={(e) => setNoticeForm((prev) => ({ ...prev, content: e.target.value }))}
            />
            <div className="flex gap-4 text-xs text-slate-600">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={noticeForm.isPinned}
                  onChange={(e) => setNoticeForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                />
                상단 고정
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={noticeForm.isDraft}
                  onChange={(e) => setNoticeForm((prev) => ({ ...prev, isDraft: e.target.checked }))}
                />
                임시저장
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-md border border-slate-200 px-3 py-2 text-xs" onClick={() => setNoticeFormOpen(false)}>
                취소
              </button>
              <button className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => void saveNotice()}>
                {noticeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                저장
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {referenceFormOpen ? (
        <Modal title={referenceForm.id == null ? "레퍼런스 추가" : "레퍼런스 수정"} onClose={() => setReferenceFormOpen(false)}>
          <div className="space-y-2">
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="이름"
              value={referenceForm.name}
              onChange={(e) => setReferenceForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="프롬프트"
              value={referenceForm.prompt}
              onChange={(e) => setReferenceForm((prev) => ({ ...prev, prompt: e.target.value }))}
            />
            <textarea
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={4}
              placeholder="설명"
              value={referenceForm.description}
              onChange={(e) => setReferenceForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="rounded-md border border-slate-200 p-3">
              <input
                className="block text-xs"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleReferenceImageChange(e.target.files?.[0])}
              />
              <p className="mt-1 text-[11px] text-slate-500">수정 시 이미지 없이 저장하면 기존 이미지를 유지합니다.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-md border border-slate-200 px-3 py-2 text-xs" onClick={() => setReferenceFormOpen(false)}>
                취소
              </button>
              <button className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => void saveReference()}>
                {referenceLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                저장
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
