
import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    BellRing,
    CheckCircle2,
    ImagePlus,
    LayoutDashboard,
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

type SectionId = "dashboard" | "users" | "blocked" | "notices" | "content";
type UserStatus = "active" | "blocked";
type NoticeStatus = "published" | "draft";
type MetricRange = "day" | "week" | "month";

type AdminUser = {
    id: number;
    nickname: string;
    email: string;
    status: UserStatus;
    joinedAt: string;
    lastActiveAt: string;
    reportCount: number;
    blockedAt: string | null;
    blockReason: string | null;
};

type NoticeItem = {
    id: number;
    title: string;
    body: string;
    pinned: boolean;
    status: NoticeStatus;
    updatedAt: string;
};

type ContentItem = {
    id: number;
    title: string;
    summary: string;
    keywords: string;
    createdAt: string;
};

type AdminConsolePageProps = {
    adminId?: string;
    onLogout: () => void;
    onBackHome?: () => void;
};

const NAV_ITEMS: Array<{ id: SectionId; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "users", label: "사용자 관리", icon: Users },
    { id: "blocked", label: "차단 사용자", icon: UserX },
    { id: "notices", label: "공지 관리", icon: Megaphone },
    { id: "content", label: "콘텐츠 관리", icon: Sparkles },
];

const SECTION_META: Record<SectionId, { title: string; description: string }> = {
    dashboard: { title: "운영 대시보드", description: "핵심 지표와 운영 이벤트를 파악합니다." },
    users: { title: "사용자 관리", description: "회원 상태 조회, 차단/해제를 관리합니다." },
    blocked: { title: "차단 사용자 목록", description: "차단 이력과 사유를 점검합니다." },
    notices: { title: "공지 관리", description: "공지 작성/수정/삭제를 운영합니다." },
    content: { title: "요즘/콘텐츠 관리", description: "운영 콘텐츠를 추가하고 정리합니다." },
};

const INITIAL_USERS: AdminUser[] = [
    { id: 1, nickname: "hyeri", email: "hyeri@persona.app", status: "active", joinedAt: "2026-01-08", lastActiveAt: "2026-02-13 15:42", reportCount: 0, blockedAt: null, blockReason: null },
    { id: 2, nickname: "joon", email: "joon@persona.app", status: "blocked", joinedAt: "2025-12-28", lastActiveAt: "2026-02-04 10:25", reportCount: 5, blockedAt: "2026-02-04 12:02", blockReason: "반복적인 부적절 콘텐츠 업로드" },
    { id: 3, nickname: "seohyun", email: "seohyun@persona.app", status: "active", joinedAt: "2026-02-02", lastActiveAt: "2026-02-13 17:03", reportCount: 1, blockedAt: null, blockReason: null },
    { id: 4, nickname: "mino", email: "mino@persona.app", status: "blocked", joinedAt: "2025-11-15", lastActiveAt: "2026-01-30 18:21", reportCount: 7, blockedAt: "2026-01-30 19:10", blockReason: "악성 도배" },
];

const INITIAL_NOTICES: NoticeItem[] = [
    { id: 1, title: "2월 3주차 서비스 점검 안내", body: "2/18 02:00~04:00 점검", pinned: true, status: "published", updatedAt: "2026-02-12 09:10" },
    { id: 2, title: "콘텐츠 정책 업데이트", body: "업로드 정책 일부 개정", pinned: false, status: "published", updatedAt: "2026-02-10 15:24" },
    { id: 3, title: "신규 템플릿 베타 안내", body: "베타 사용자 대상 오픈", pinned: false, status: "draft", updatedAt: "2026-02-09 13:40" },
];

const INITIAL_CONTENTS: ContentItem[] = [
    { id: 1, title: "도시 감성 브랜딩 페르소나", summary: "MZ 타깃 SNS 캠페인", keywords: "브랜딩, SNS, 도시감성", createdAt: "2026-02-11 16:23" },
    { id: 2, title: "뷰티 쇼츠 스크립트 팩", summary: "30초 릴스 카피 구조", keywords: "뷰티, 숏폼, 카피라이팅", createdAt: "2026-02-12 11:16" },
];

const METRICS_BY_RANGE: Record<MetricRange, { visitors: number; sessions: number; contents: number; newMembers: number }> = {
    day: { visitors: 784, sessions: 624, contents: 28, newMembers: 16 },
    week: { visitors: 7632, sessions: 5710, contents: 146, newMembers: 88 },
    month: { visitors: 27422, sessions: 21140, contents: 518, newMembers: 301 },
};

const TRAFFIC_SERIES: Record<MetricRange, Array<{ label: string; visitors: number }>> = {
    day: [{ label: "00", visitors: 68 }, { label: "04", visitors: 41 }, { label: "08", visitors: 132 }, { label: "12", visitors: 219 }, { label: "16", visitors: 183 }, { label: "20", visitors: 141 }],
    week: [{ label: "월", visitors: 992 }, { label: "화", visitors: 1041 }, { label: "수", visitors: 1128 }, { label: "목", visitors: 1279 }, { label: "금", visitors: 1342 }, { label: "토", visitors: 980 }, { label: "일", visitors: 870 }],
    month: [{ label: "1주", visitors: 6243 }, { label: "2주", visitors: 6832 }, { label: "3주", visitors: 7018 }, { label: "4주", visitors: 7329 }],
};

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function nowText() {
    return new Date().toLocaleString("ko-KR", { hour12: false });
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("ko-KR").format(value);
}
export function AdminConsolePage({ adminId = "admin", onLogout, onBackHome }: AdminConsolePageProps) {
    const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
    const [range, setRange] = useState<MetricRange>("week");
    const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
    const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
    const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
    const [toast, setToast] = useState("");
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [noticeMode, setNoticeMode] = useState<"create" | "edit">("create");
    const [noticeDraft, setNoticeDraft] = useState({ id: null as number | null, title: "", body: "", pinned: false, status: "published" as NoticeStatus });
    const [contentFormOpen, setContentFormOpen] = useState(false);
    const [contentDraft, setContentDraft] = useState({ title: "", summary: "", keywords: "" });

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(""), 2200);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const sectionInfo = SECTION_META[activeSection];
    const metrics = METRICS_BY_RANGE[range];
    const traffic = TRAFFIC_SERIES[range];
    const maxTraffic = Math.max(...traffic.map((item) => item.visitors), 1);

    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((user) => {
            const filterPassed = statusFilter === "all" ? true : user.status === statusFilter;
            if (!filterPassed) return false;
            if (!q) return true;
            return user.nickname.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
        });
    }, [users, query, statusFilter]);

    const blockedUsers = useMemo(() => users.filter((user) => user.status === "blocked"), [users]);

    const handleToggleBlock = (id: number) => {
        setUsers((prev) =>
            prev.map((user) => {
                if (user.id !== id) return user;
                if (user.status === "blocked") {
                    return { ...user, status: "active", blockedAt: null, blockReason: null };
                }
                return { ...user, status: "blocked", blockedAt: nowText(), blockReason: "관리자 수동 차단" };
            })
        );
        setToast("사용자 상태를 업데이트했습니다.");
    };

    const openCreateNotice = () => {
        setNoticeMode("create");
        setNoticeDraft({ id: null, title: "", body: "", pinned: false, status: "published" });
        setNoticeModalOpen(true);
    };

    const openEditNotice = (notice: NoticeItem) => {
        setNoticeMode("edit");
        setNoticeDraft({ id: notice.id, title: notice.title, body: notice.body, pinned: notice.pinned, status: notice.status });
        setNoticeModalOpen(true);
    };

    const saveNotice = () => {
        const title = noticeDraft.title.trim();
        const body = noticeDraft.body.trim();
        if (!title || !body) {
            setToast("공지 제목과 내용을 입력해 주세요.");
            return;
        }

        if (noticeMode === "edit" && noticeDraft.id != null) {
            setNotices((prev) => prev.map((n) => (n.id === noticeDraft.id ? { ...n, title, body, pinned: noticeDraft.pinned, status: noticeDraft.status, updatedAt: nowText() } : n)));
            setToast("공지를 수정했습니다.");
        } else {
            setNotices((prev) => [{ id: Date.now(), title, body, pinned: noticeDraft.pinned, status: noticeDraft.status, updatedAt: nowText() }, ...prev]);
            setToast("공지를 추가했습니다.");
        }
        setNoticeModalOpen(false);
    };

    const submitContent = () => {
        const title = contentDraft.title.trim();
        const summary = contentDraft.summary.trim();
        const keywords = contentDraft.keywords.trim();
        if (!title || !summary || !keywords) {
            setToast("제목, 설명, 키워드는 필수입니다.");
            return;
        }

        setContents((prev) => [{ id: Date.now(), title, summary, keywords, createdAt: nowText() }, ...prev]);
        setContentDraft({ title: "", summary: "", keywords: "" });
        setContentFormOpen(false);
        setToast("콘텐츠를 등록했습니다.");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#edf1ff] text-slate-900">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 left-[-120px] h-72 w-72 rounded-full bg-[#93c5fd]/45 blur-3xl" />
                <div className="absolute bottom-[-140px] right-[-120px] h-80 w-80 rounded-full bg-[#fdba74]/40 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1480px] p-4 sm:p-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 lg:p-8">
                <aside className="mb-5 lg:mb-0">
                    <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur lg:sticky lg:top-6">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white"><BarChart3 className="h-4 w-4" /></div>
                            <div><p className="text-xs tracking-[0.12em] text-slate-500">PERSONA</p><p className="text-sm font-semibold text-slate-900">ADMIN CONSOLE</p></div>
                        </div>
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition", activeSection === item.id ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-600 hover:bg-white hover:text-slate-900")}>
                                        <Icon className="h-4 w-4" /><span className="font-semibold">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="space-y-5">
                    <header className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{sectionInfo.title}</h1>
                                <p className="mt-1 text-sm text-slate-500">{sectionInfo.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {onBackHome ? <button type="button" onClick={onBackHome} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">홈으로</button> : null}
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"><Users className="h-4 w-4" /></div>
                                    <div className="text-sm"><div className="font-semibold text-slate-900">Admin</div><div className="text-xs text-slate-500">{adminId}</div></div>
                                    <button type="button" onClick={onLogout} className="ml-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-3.5 w-3.5" />로그아웃</button>
                                </div>
                            </div>
                        </div>
                    </header>
                    {activeSection === "dashboard" ? (
                        <section className="space-y-4">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                {(["day", "week", "month"] as MetricRange[]).map((item) => (
                                    <button key={item} type="button" onClick={() => setRange(item)} className={cn("rounded-lg px-3 py-1.5 text-sm transition", range === item ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500")}>
                                        {item === "day" ? "일간" : item === "week" ? "주간" : "월간"}
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5"><p className="text-xs tracking-[0.16em] text-slate-500">방문자 수</p><p className="mt-2 text-3xl font-bold">{formatNumber(metrics.visitors)}</p></article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5"><p className="text-xs tracking-[0.16em] text-slate-500">진단 진행 수</p><p className="mt-2 text-3xl font-bold">{formatNumber(metrics.sessions)}</p></article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5"><p className="text-xs tracking-[0.16em] text-slate-500">신규 회원</p><p className="mt-2 text-3xl font-bold">{formatNumber(metrics.newMembers)}</p></article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5"><p className="text-xs tracking-[0.16em] text-slate-500">콘텐츠 생성</p><p className="mt-2 text-3xl font-bold">{formatNumber(metrics.contents)}</p></article>
                            </div>

                            <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                <h3 className="text-lg font-semibold text-slate-900">방문 추이</h3>
                                <div className="mt-4 grid grid-cols-6 gap-2">
                                    {traffic.map((item) => (
                                        <div key={item.label} className="flex flex-col items-center gap-2">
                                            <div className="relative flex h-36 w-full items-end rounded-xl bg-slate-100/80 p-2">
                                                <div className="w-full rounded-lg bg-gradient-to-t from-[#f97316] to-[#fdba74]" style={{ height: `${Math.max((item.visitors / maxTraffic) * 100, 8)}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        </section>
                    ) : null}

                    {activeSection === "users" ? (
                        <section className="space-y-4">
                            <div className="rounded-2xl border border-white/70 bg-white/85 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="닉네임 또는 이메일 검색" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm" />
                                    </div>
                                    <div className="flex gap-2">
                                        {(["all", "active", "blocked"] as const).map((item) => (
                                            <button key={item} type="button" onClick={() => setStatusFilter(item)} className={cn("rounded-xl px-3 py-2 text-sm transition", statusFilter === item ? "bg-slate-900 font-semibold text-white" : "border border-slate-200 bg-white text-slate-600")}>
                                                {item === "all" ? "전체" : item === "active" ? "정상" : "차단"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">사용자</th><th className="px-4 py-3">가입일</th><th className="px-4 py-3">최근 활동</th><th className="px-4 py-3">신고</th><th className="px-4 py-3">상태</th><th className="px-4 py-3 text-right">액션</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-3"><div className="font-semibold text-slate-900">{user.nickname}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                                                    <td className="px-4 py-3 text-slate-600">{user.joinedAt}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.lastActiveAt}</td>
                                                    <td className="px-4 py-3">{user.reportCount}건</td>
                                                    <td className="px-4 py-3">{user.status === "blocked" ? <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">차단</span> : <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">정상</span>}</td>
                                                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => handleToggleBlock(user.id)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", user.status === "blocked" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{user.status === "blocked" ? "차단 해제" : "차단"}</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    ) : null}
                    {activeSection === "blocked" ? (
                        <section className="space-y-3">
                            {blockedUsers.map((user) => (
                                <article key={user.id} className="rounded-2xl border border-white/70 bg-white/85 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-slate-900">{user.nickname}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                            <div className="mt-1 text-xs text-slate-500">차단일 {user.blockedAt || "-"} / 사유 {user.blockReason || "-"}</div>
                                        </div>
                                        <button type="button" onClick={() => handleToggleBlock(user.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />차단 해제</button>
                                    </div>
                                </article>
                            ))}
                            {blockedUsers.length === 0 ? <div className="rounded-2xl border border-white/70 bg-white/85 p-8 text-center text-sm text-slate-500">현재 차단된 사용자가 없습니다.</div> : null}
                        </section>
                    ) : null}

                    {activeSection === "notices" ? (
                        <section className="space-y-4">
                            <div className="flex justify-end"><button type="button" onClick={openCreateNotice} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />공지 추가</button></div>
                            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">제목</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">업데이트</th><th className="px-4 py-3 text-right">액션</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {notices.map((notice) => (
                                                <tr key={notice.id}>
                                                    <td className="px-4 py-3"><div className="font-semibold text-slate-900">{notice.title}</div><div className="text-xs text-slate-500">{notice.body}</div></td>
                                                    <td className="px-4 py-3"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", notice.status === "published" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{notice.status === "published" ? "게시중" : "임시저장"}</span>{notice.pinned ? <span className="ml-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">고정</span> : null}</td>
                                                    <td className="px-4 py-3 text-slate-600">{notice.updatedAt}</td>
                                                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => openEditNotice(notice)} className="mr-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"><Pencil className="h-3.5 w-3.5" />수정</button><button type="button" onClick={() => setNotices((prev) => prev.filter((n) => n.id !== notice.id))} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" />삭제</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "content" ? (
                        <section className="space-y-4">
                            <div className="flex justify-end"><button type="button" onClick={() => setContentFormOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><ImagePlus className="h-4 w-4" />{contentFormOpen ? "추가 폼 닫기" : "콘텐츠 추가"}</button></div>
                            {contentFormOpen ? (
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <h3 className="text-base font-semibold text-slate-900">새 콘텐츠 등록</h3>
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <input value={contentDraft.title} onChange={(e) => setContentDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="제목" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                                        <input value={contentDraft.keywords} onChange={(e) => setContentDraft((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="키워드 (쉼표 구분)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                                        <textarea value={contentDraft.summary} onChange={(e) => setContentDraft((prev) => ({ ...prev, summary: e.target.value }))} placeholder="간단 설명" rows={4} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
                                    </div>
                                    <div className="mt-4 flex justify-end"><button type="button" onClick={submitContent} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />등록</button></div>
                                </article>
                            ) : null}
                            <div className="grid gap-3 md:grid-cols-2">
                                {contents.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-white/70 bg-white/85 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div><h4 className="text-base font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-sm text-slate-600">{item.summary}</p></div>
                                            <button type="button" onClick={() => setContents((prev) => prev.filter((c) => c.id !== item.id))} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" />삭제</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>

            {toast ? <div className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl"><BellRing className="h-4 w-4" />{toast}</div> : null}

            {noticeModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-900">{noticeMode === "edit" ? "공지 수정" : "공지 추가"}</h3>
                        <div className="mt-4 space-y-3">
                            <input value={noticeDraft.title} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="공지 제목" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
                            <textarea value={noticeDraft.body} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, body: e.target.value }))} placeholder="공지 내용" rows={5} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                                <label className="inline-flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={noticeDraft.pinned} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, pinned: e.target.checked }))} />상단 고정</label>
                                <select value={noticeDraft.status} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, status: e.target.value as NoticeStatus }))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"><option value="published">게시</option><option value="draft">임시저장</option></select>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" onClick={() => setNoticeModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">취소</button>
                            <button type="button" onClick={saveNotice} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />저장</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
