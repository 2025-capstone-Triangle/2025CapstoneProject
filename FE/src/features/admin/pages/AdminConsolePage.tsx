﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿
import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    BellRing,
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
    createAdminNotice,
    deleteAdminNotice,
    getAdminNotices,
    updateAdminNotice,
} from "../lib/noticeApi";
import { getAdminMembers, updateAdminMemberStatus } from "../lib/memberAdminApi";

type SectionId = "dashboard" | "users" | "blocked" | "notices" | "content";
type UserStatus = "ACTIVE" | "BANNED";
type MetricRange = "day" | "week" | "month";

type AdminUser = {
    id: number;
    username: string;
    email: string;
    role: string;
    birth: string;
    sex: "MALE" | "FEMALE" | "ETC";
    isCreator: boolean;
    createdAt: string;
    status: UserStatus;
};

type NoticeItem = {
    id: number;
    title: string;
    author: string;
    content: string;
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "blocked", label: "Blocked Users", icon: UserX },
    { id: "notices", label: "Notices", icon: Megaphone },
    { id: "content", label: "Content", icon: Sparkles },
];
const SECTION_META: Record<SectionId, { title: string; description: string }> = {
    dashboard: { title: "Admin Dashboard", description: "Track service status and usage." },
    users: { title: "User Management", description: "Review users and block or unblock accounts." },
    blocked: { title: "Blocked Users", description: "See blocked accounts and reasons." },
    notices: { title: "Notice Management", description: "Create, edit, and delete notices." },
    content: { title: "Content Management", description: "Add and maintain content." },
};
const INITIAL_CONTENTS: ContentItem[] = [
    { id: 1, title: "Branding Idea", summary: "Short campaign concept.", keywords: "branding, social", createdAt: "2026-02-11 16:23" },
    { id: 2, title: "Beauty Script", summary: "30s reel copy structure.", keywords: "beauty, shortform", createdAt: "2026-02-12 11:16" },
];
const METRICS_BY_RANGE: Record<MetricRange, { visitors: number; sessions: number; contents: number; newMembers: number }> = {
    day: { visitors: 784, sessions: 624, contents: 28, newMembers: 16 },
    week: { visitors: 7632, sessions: 5710, contents: 146, newMembers: 88 },
    month: { visitors: 27422, sessions: 21140, contents: 518, newMembers: 301 },
};

const TRAFFIC_SERIES: Record<MetricRange, Array<{ label: string; visitors: number }>> = {
    day: [
        { label: "00", visitors: 68 },
        { label: "04", visitors: 41 },
        { label: "08", visitors: 132 },
        { label: "12", visitors: 219 },
        { label: "16", visitors: 183 },
        { label: "20", visitors: 141 },
    ],
    week: [
        { label: "Mon", visitors: 992 },
        { label: "Tue", visitors: 1041 },
        { label: "Wed", visitors: 1128 },
        { label: "Thu", visitors: 1279 },
        { label: "Fri", visitors: 1342 },
        { label: "Sat", visitors: 980 },
        { label: "Sun", visitors: 870 },
    ],
    month: [
        { label: "W1", visitors: 6243 },
        { label: "W2", visitors: 6832 },
        { label: "W3", visitors: 7018 },
        { label: "W4", visitors: 7329 },
    ],
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
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [notices, setNotices] = useState<NoticeItem[]>([]);
    const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
    const [memberLoading, setMemberLoading] = useState(false);
    const [toast, setToast] = useState("");
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [noticeMode, setNoticeMode] = useState<"create" | "edit">("create");
    const [noticeDraft, setNoticeDraft] = useState({ id: null as number | null, title: "", content: "" });
    const [contentFormOpen, setContentFormOpen] = useState(false);
    const [contentDraft, setContentDraft] = useState({ title: "", summary: "", keywords: "" });

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(""), 2200);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const loadNotices = async () => {
        try {
            setNoticeLoading(true);
            const data = await getAdminNotices();
            setNotices(data);
        } catch (error) {
            console.error("[admin.notice.list]", error);
            setToast("공지 조회에 실패했습니다.");
        } finally {
            setNoticeLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            setMemberLoading(true);
            const data = await getAdminMembers();
            const mapped = data.map((item) => ({
                id: item.id,
                username: item.username,
                email: item.email,
                role: item.role,
                birth: item.birth,
                sex: item.sex,
                isCreator: item.is_creator,
                createdAt: item.createdAt,
                status: item.status,
            }));
            setUsers(mapped);
        } catch (error) {
            console.error("[admin.member.list]", error);
            setToast("멤버 조회에 실패했습니다.");
        } finally {
            setMemberLoading(false);
        }
    };

    useEffect(() => {
        loadNotices();
        loadMembers();
    }, []);

    const openCreateNotice = () => {
        setNoticeMode("create");
        setNoticeDraft({ id: null, title: "", content: "" });
        setNoticeModalOpen(true);
    };

    const openEditNotice = (notice: NoticeItem) => {
        setNoticeMode("edit");
        setNoticeDraft({ id: notice.id, title: notice.title, content: notice.content });
        setNoticeModalOpen(true);
    };

    const saveNotice = async () => {
        const title = noticeDraft.title.trim();
        const content = noticeDraft.content.trim();
        if (!title || !content) {
            setToast("공지 제목과 내용을 입력해 주세요.");
            return;
        }

        try {
            setNoticeLoading(true);
            if (noticeMode === "edit" && noticeDraft.id != null) {
                await updateAdminNotice(noticeDraft.id, { title, content });
                setToast("공지를 수정했습니다.");
            } else {
                await createAdminNotice({ title, content });
                setToast("공지를 등록했습니다.");
            }
            await loadNotices();
            setNoticeModalOpen(false);
        } catch (error) {
            console.error("[admin.notice.save]", error);
            setToast("공지 저장에 실패했습니다.");
        } finally {
            setNoticeLoading(false);
        }
    };

    const handleDeleteNotice = async (id: number) => {
        const confirmed = window.confirm("공지사항을 삭제할까요?");
        if (!confirmed) return;

        try {
            setNoticeLoading(true);
            await deleteAdminNotice(id);
            await loadNotices();
            setToast("공지를 삭제했습니다.");
        } catch (error) {
            console.error("[admin.notice.delete]", error);
            setToast("공지 삭제에 실패했습니다.");
        } finally {
            setNoticeLoading(false);
        }
    };
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
            return user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
        });
    }, [users, query, statusFilter]);

    const blockedUsers = useMemo(() => users.filter((user) => user.status === "BANNED"), [users]);

    const handleToggleBlock = async (id: number) => {
        try {
            setMemberLoading(true);
            const target = users.find((user) => user.id === id);
            if (!target) return;
            const nextStatus = target.status === "BANNED" ? "ACTIVE" : "BANNED";
            await updateAdminMemberStatus(id, nextStatus);
            await loadMembers();
            setToast(nextStatus === "BANNED" ? "멤버를 차단했습니다." : "멤버 차단을 해제했습니다.");
        } catch (error) {
            console.error("[admin.member.update]", error);
            setToast("멤버 상태 변경에 실패했습니다.");
        } finally {
            setMemberLoading(false);
        }
    };

    const submitContent = () => {
        const title = contentDraft.title.trim();
        const summary = contentDraft.summary.trim();
        const keywords = contentDraft.keywords.trim();
        if (!title || !summary || !keywords) {
            setToast("Title, summary, and keywords are required.");
            return;
        }

        setContents((prev) => [{ id: Date.now(), title, summary, keywords, createdAt: nowText() }, ...prev]);
        setContentDraft({ title: "", summary: "", keywords: "" });
        setContentFormOpen(false);
        setToast("Content saved.");
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
                                {onBackHome ? <button type="button" onClick={onBackHome} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Back</button> : null}
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"><Users className="h-4 w-4" /></div>
                                    <div className="text-sm"><div className="font-semibold text-slate-900">Admin</div><div className="text-xs text-slate-500">{adminId}</div></div>
                                    <button type="button" onClick={onLogout} className="ml-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-3.5 w-3.5" />Logout</button>
                                </div>
                            </div>
                        </div>
                    </header>
                    {activeSection === "dashboard" ? (
                        <section className="space-y-4">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                                {(["day", "week", "month"] as MetricRange[]).map((item) => (
                                    <button key={item} type="button" onClick={() => setRange(item)} className={cn("rounded-lg px-3 py-1.5 text-sm transition", range === item ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500")}>
                                        {item === "day" ? "Day" : item === "week" ? "Week" : "Month"}
                                    </button>
                                ))}
                            </div>

                                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <p className="text-xs tracking-[0.16em] text-slate-500">Visitors</p>
                                    <p className="mt-2 text-3xl font-bold">{formatNumber(metrics.visitors)}</p>
                                </article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <p className="text-xs tracking-[0.16em] text-slate-500">Sessions</p>
                                    <p className="mt-2 text-3xl font-bold">{formatNumber(metrics.sessions)}</p>
                                </article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <p className="text-xs tracking-[0.16em] text-slate-500">New members</p>
                                    <p className="mt-2 text-3xl font-bold">{formatNumber(metrics.newMembers)}</p>
                                </article>
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <p className="text-xs tracking-[0.16em] text-slate-500">Content created</p>
                                    <p className="mt-2 text-3xl font-bold">{formatNumber(metrics.contents)}</p>
                                </article>
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
                                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username or email" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm" />
                                    </div>
                                    <div className="flex gap-2">
                                        {(["all", "ACTIVE", "BANNED"] as const).map((item) => (
                                            <button key={item} type="button" onClick={() => setStatusFilter(item)} className={cn("rounded-xl px-3 py-2 text-sm transition", statusFilter === item ? "bg-slate-900 font-semibold text-white" : "border border-slate-200 bg-white text-slate-600")}>
                                                {item === "all" ? "All" : item === "ACTIVE" ? "Active" : "Banned"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Birth</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-3"><div className="font-semibold text-slate-900">{user.username}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                                                    <td className="px-4 py-3 text-slate-600">{user.createdAt}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.birth}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.role}</td>
                                                    <td className="px-4 py-3">{user.status === "BANNED" ? <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Banned</span> : <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>}</td>
                                                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => handleToggleBlock(user.id)} disabled={memberLoading} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold", user.status === "BANNED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700", memberLoading ? "opacity-60 cursor-not-allowed" : "")}>{user.status === "BANNED" ? "Unban" : "Ban"}</button></td>
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
                                            <div className="font-semibold text-slate-900">{user.username}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                            <div className="mt-1 text-xs text-slate-500">Status: {user.status} / Role: {user.role}</div>
                                        </div>
                                        <button type="button" onClick={() => handleToggleBlock(user.id)} disabled={memberLoading} className={cn("inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700", memberLoading ? "opacity-60 cursor-not-allowed" : "")}><CheckCircle2 className="h-4 w-4" />Unban</button>
                                    </div>
                                </article>
                            ))}
                            {blockedUsers.length === 0 ? <div className="rounded-2xl border border-white/70 bg-white/85 p-8 text-center text-sm text-slate-500">No blocked users.</div> : null}
                        </section>
                    ) : null}
                    {activeSection === "notices" ? (
                        <section className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-xs text-slate-500">
                                    {noticeLoading ? "공지 불러오는 중..." : "총 " + notices.length + "건"}
                                </div>
                                <button type="button" onClick={openCreateNotice} disabled={noticeLoading} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                                    {noticeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    {noticeLoading ? "Loading..." : "공지 추가"}
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Author</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {notices.map((notice) => (
                                                <tr key={notice.id}>
                                                    <td className="px-4 py-3"><div className="font-semibold text-slate-900">{notice.title}</div><div className="text-xs text-slate-500">{notice.content}</div></td>
                                                    <td className="px-4 py-3 text-slate-600">{notice.author}</td>
                                                    <td className="px-4 py-3 text-slate-600">{notice.updatedAt}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button type="button" onClick={() => openEditNotice(notice)} disabled={noticeLoading} className="mr-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                                                            {noticeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                                                            {noticeLoading ? "Loading..." : "Edit"}
                                                        </button>
                                                        <button type="button" onClick={() => handleDeleteNotice(notice.id)} disabled={noticeLoading} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
                                                            {noticeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                            {noticeLoading ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!noticeLoading && notices.length === 0 ? (
                                                <tr><td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={4}>No notices found.</td></tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    ) : null}
                    {activeSection === "content" ? (
                        <section className="space-y-4">
                            <div className="flex justify-end"><button type="button" onClick={() => setContentFormOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><ImagePlus className="h-4 w-4" />{contentFormOpen ? "Close form" : "Add content"}</button></div>
                            {contentFormOpen ? (
                                <article className="rounded-2xl border border-white/70 bg-white/85 p-5">
                                    <h3 className="text-base font-semibold text-slate-900">New content</h3>
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <input value={contentDraft.title} onChange={(e) => setContentDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Keywords (comma separated)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                                        <input value={contentDraft.keywords} onChange={(e) => setContentDraft((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="Keywords (comma separated)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                                        <textarea value={contentDraft.summary} onChange={(e) => setContentDraft((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Summary" rows={4} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
                                    </div>
                                    <div className="mt-4 flex justify-end"><button type="button" onClick={submitContent} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />Save</button></div>
                                </article>
                            ) : null}
                            <div className="grid gap-3 md:grid-cols-2">
                                {contents.map((item) => (
                                    <article key={item.id} className="rounded-2xl border border-white/70 bg-white/85 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div><h4 className="text-base font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-sm text-slate-600">{item.summary}</p></div>
                                            <button type="button" onClick={() => setContents((prev) => prev.filter((c) => c.id !== item.id))} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" />Delete</button>
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
                <textarea value={noticeDraft.content} onChange={(e) => setNoticeDraft((prev) => ({ ...prev, content: e.target.value }))} placeholder="공지 내용" rows={5} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setNoticeModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">취소</button>
                <button type="button" onClick={saveNotice} disabled={noticeLoading} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                    {noticeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {noticeLoading ? "Saving..." : "저장"}
                </button>
            </div>
        </div>
    </div>
) : null}
        </div>
    );
}

