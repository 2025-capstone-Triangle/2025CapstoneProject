import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Shield,
  User,
} from "lucide-react";
import {
  clearAuth,
  deleteMemberAccount,
  getMemberInfo,
  signOut,
  updateMemberEmail,
  updateMemberPassword,
  updateMemberProfile,
  verifyMemberPassword,
  type MemberInfo,
} from "../../../lib/auth";
import { getNoticeList, getPinnedNoticeList, type Notice } from "../../notice/lib/noticeApi";

interface SettingsPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

type LanguageType = "ko" | "en";
type SexType = "MALE" | "FEMALE" | "ETC";

const LANGUAGE_STORAGE_KEY = "app-language";

function getSavedLanguage(): LanguageType {
  const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return raw === "en" ? "en" : "ko";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SettingsTopBar({ onBack }: { onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="h-[56px] flex items-center px-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100" onClick={onBack}>
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="flex-1 text-center font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black pr-9">설정</h1>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-['Noto_Sans_KR'] text-[15px] font-medium text-black">{label}</p>
        {description ? <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500 mt-0.5">{description}</p> : null}
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="px-1">
        <p className="text-xs font-semibold tracking-[0.16em] text-gray-500">{title}</p>
        {description ? <p className="mt-1 text-[11px] text-gray-400">{description}</p> : null}
      </div>
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">{children}</div>
    </section>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[360px] rounded-[20px] bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-['NEXON_Football_Gothic'] text-[18px] text-black">{title}</h3>
          <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SettingsPage({ onBack, onNavigate }: SettingsPageProps) {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [birth, setBirth] = useState("");
  const [sex, setSex] = useState<SexType>("ETC");
  const [isCreator, setIsCreator] = useState(false);

  const [emailForm, setEmailForm] = useState({ currentPassword: "", nextEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", nextPassword: "", confirmPassword: "" });

  const [language, setLanguage] = useState<LanguageType>(getSavedLanguage());
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const [noticeLoading, setNoticeLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pinnedNotices, setPinnedNotices] = useState<Notice[]>([]);

  const appVersion = "1.0.0";

  const loadMember = async () => {
    setLoading(true);
    setError("");
    try {
      const info = await getMemberInfo();
      setMember(info);
      setBirth(info.birth ?? "");
      setSex((info.sex ?? "ETC") as SexType);
      setIsCreator(Boolean(info.is_creator));
    } catch (err) {
      const text = err instanceof Error ? err.message : "회원 정보를 불러오지 못했습니다.";
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!message && !error) return;
    const timer = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [message, error]);

  const handleUpdateProfile = async () => {
    if (!birth) {
      setError("생년월일을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      await updateMemberProfile({ birth, sex, is_creator: isCreator });
      await loadMember();
      setProfileModalOpen(false);
      setMessage("기본 정보를 수정했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailForm.currentPassword || !emailForm.nextEmail.trim()) {
      setError("현재 비밀번호와 변경할 이메일을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const isPasswordValid = await verifyMemberPassword(emailForm.currentPassword);
      if (!isPasswordValid) {
        setError("현재 비밀번호가 일치하지 않습니다.");
        return;
      }
      await updateMemberEmail(emailForm.nextEmail.trim());
      setEmailForm({ currentPassword: "", nextEmail: "" });
      await loadMember();
      setEmailModalOpen(false);
      setMessage("이메일을 변경했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.nextPassword) {
      setError("현재 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }
    if (passwordForm.nextPassword.length < 6) {
      setError("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    try {
      const isPasswordValid = await verifyMemberPassword(passwordForm.currentPassword);
      if (!isPasswordValid) {
        setError("현재 비밀번호가 일치하지 않습니다.");
        return;
      }
      await updateMemberPassword(passwordForm.nextPassword);
      setPasswordForm({ currentPassword: "", nextPassword: "", confirmPassword: "" });
      setPasswordModalOpen(false);
      setMessage("비밀번호를 변경했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const openNoticeModal = async () => {
    setNoticeModalOpen(true);
    setNoticeLoading(true);
    try {
      const [all, pinned] = await Promise.all([getNoticeList(), getPinnedNoticeList()]);
      setNotices(all.filter((item) => !item.isDraft));
      setPinnedNotices(pinned.filter((item) => !item.isDraft));
    } catch (err) {
      setError(err instanceof Error ? err.message : "공지 조회에 실패했습니다.");
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleInquiry = () => {
    window.location.href = "mailto:support@persona.com?subject=" + encodeURIComponent("[1:1 문의]");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // 서버 로그아웃 실패여도 클라이언트 로그아웃은 진행
    } finally {
      clearAuth();
      onNavigate?.("home");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말 회원 탈퇴하시겠습니까?")) return;

    setSaving(true);
    try {
      await deleteMemberAccount();
      clearAuth();
      onNavigate?.("home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const languageLabel = useMemo(() => (language === "ko" ? "한국어" : "English"), [language]);
  const profileSummary = useMemo(() => {
    if (!member) return "";
    return `${member.username} / ${member.email}`;
  }, [member]);

  return (
    <div className="bg-gray-50 min-h-screen max-w-[390px] mx-auto">
      <SettingsTopBar onBack={onBack} />

      <div className="py-4 px-4 space-y-4">
        {loading ? (
          <div className="rounded-xl bg-white border border-gray-100 p-6 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            회원 정보를 불러오는 중
          </div>
        ) : null}

        <SettingsGroup title="계정" description="회원 정보와 보안 설정">
          <SettingRow icon={User} label="정보 수정" description={profileSummary} onClick={() => setProfileModalOpen(true)} />
          <SettingRow icon={Mail} label="이메일 변경" onClick={() => setEmailModalOpen(true)} />
          <SettingRow icon={KeyRound} label="비밀번호 변경" onClick={() => setPasswordModalOpen(true)} />
        </SettingsGroup>

        <SettingsGroup title="서비스" description="공지 및 이용 정보">
          <SettingRow icon={Bell} label="공지사항" description="서비스 공지 및 업데이트" onClick={openNoticeModal} />
          <SettingRow icon={Mail} label="1:1 문의" description="support@persona.com" onClick={handleInquiry} />
          <SettingRow icon={FileText} label="앱 버전 및 이용약관" description={`v${appVersion}`} onClick={() => setTermsModalOpen(true)} />
        </SettingsGroup>

        <SettingsGroup title="앱 설정">
          <SettingRow
            icon={Globe}
            label="언어"
            description={languageLabel}
            onClick={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
          />
        </SettingsGroup>

        <SettingsGroup title="계정 관리">
          <SettingRow icon={LogOut} label="로그아웃" onClick={handleLogout} />
          <SettingRow icon={Shield} label="회원 탈퇴" description="계정 및 데이터 삭제" onClick={handleDeleteAccount} />
        </SettingsGroup>

        {message ? <div className="rounded-md bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700">{message}</div> : null}
        {error ? <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">{error}</div> : null}
      </div>

      {profileModalOpen ? (
        <Sheet title="정보 수정" onClose={() => setProfileModalOpen(false)}>
          <div className="space-y-2">
            <input
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="YYYY-MM-DD"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              {(["MALE", "FEMALE", "ETC"] as const).map((value) => (
                <button
                  key={value}
                  className={cn(
                    "h-9 rounded-md text-xs border",
                    sex === value ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200",
                  )}
                  onClick={() => setSex(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={isCreator} onChange={(e) => setIsCreator(e.target.checked)} />
              크리에이터 계정
            </label>
            <button className="w-full h-10 rounded-md bg-black text-white text-sm disabled:opacity-60" onClick={handleUpdateProfile} disabled={saving}>
              정보 저장
            </button>
          </div>
        </Sheet>
      ) : null}

      {emailModalOpen ? (
        <Sheet title="이메일 변경" onClose={() => setEmailModalOpen(false)}>
          <div className="space-y-2">
            <input
              type="password"
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="현재 비밀번호"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <input
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="새 이메일"
              value={emailForm.nextEmail}
              onChange={(e) => setEmailForm((prev) => ({ ...prev, nextEmail: e.target.value }))}
            />
            <button className="w-full h-10 rounded-md border border-black text-black text-sm disabled:opacity-60" onClick={handleUpdateEmail} disabled={saving}>
              이메일 변경
            </button>
          </div>
        </Sheet>
      ) : null}

      {passwordModalOpen ? (
        <Sheet title="비밀번호 변경" onClose={() => setPasswordModalOpen(false)}>
          <div className="space-y-2">
            <input
              type="password"
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="현재 비밀번호"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <input
              type="password"
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="새 비밀번호"
              value={passwordForm.nextPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, nextPassword: e.target.value }))}
            />
            <input
              type="password"
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
              placeholder="새 비밀번호 확인"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <button className="w-full h-10 rounded-md border border-black text-black text-sm disabled:opacity-60" onClick={handleUpdatePassword} disabled={saving}>
              비밀번호 변경
            </button>
          </div>
        </Sheet>
      ) : null}

      {noticeModalOpen ? (
        <Sheet title="공지사항" onClose={() => setNoticeModalOpen(false)}>
          {noticeLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              불러오는 중
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto space-y-2">
              {pinnedNotices.map((item) => (
                <article key={`pin-${item.id}`} className="rounded-md border border-rose-100 bg-rose-50 p-3">
                  <p className="text-[11px] text-rose-600 mb-1">고정 공지</p>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(item.updatedAt)}</p>
                </article>
              ))}
              {notices.map((item) => (
                <article key={item.id} className="rounded-md border border-gray-100 p-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(item.updatedAt)}</p>
                </article>
              ))}
              {notices.length === 0 && pinnedNotices.length === 0 ? (
                <p className="text-sm text-gray-500">공지사항이 없습니다.</p>
              ) : null}
            </div>
          )}
        </Sheet>
      ) : null}

      {termsModalOpen ? (
        <Sheet title="앱 버전 및 이용약관" onClose={() => setTermsModalOpen(false)}>
          <p className="text-sm font-semibold mb-2">Person:a v{appVersion}</p>
          <ul className="text-xs text-gray-600 leading-6 list-disc list-inside">
            <li>서비스 이용 및 커뮤니티 운영 정책을 준수해야 합니다.</li>
            <li>회원 정보 변경은 본인 인증 후 반영됩니다.</li>
            <li>문의: support@persona.com</li>
          </ul>
        </Sheet>
      ) : null}
    </div>
  );
}

