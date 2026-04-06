import { X, Home, Sparkles, Bookmark, User, Settings, HelpCircle, LogOut, LogIn } from "lucide-react";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { clearAuth, getSavedAuth, isAuthenticated } from "../../lib/auth";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

function decodeJwtPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(normalized);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function HamburgerMenu({ isOpen, onClose, onNavigate, currentPage }: HamburgerMenuProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const auth = getSavedAuth();
  const tokenPayload = decodeJwtPayload(auth?.accessToken);
  const isLoggedIn = Boolean(auth?.accessToken) && isAuthenticated();

  const tokenUsername =
    (typeof tokenPayload?.username === "string" && tokenPayload.username.trim()) ||
    (typeof tokenPayload?.sub === "string" && tokenPayload.sub.trim()) ||
    "";
  const tokenEmail = typeof tokenPayload?.email === "string" ? tokenPayload.email.trim() : "";

  const displayName = auth?.username?.trim() || tokenUsername || "사용자";
  const displayEmail = auth?.email?.trim() || tokenEmail;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, 260);
  }, [onClose]);

  const handleNavigate = useCallback(
    (page: string) => {
      onNavigate?.(page);
      handleClose();
    },
    [onNavigate, handleClose],
  );

  const handleLogout = useCallback(() => {
    clearAuth();
    handleNavigate("home");
  }, [handleNavigate]);

  const menuItems = useMemo(
    () => [
      { id: "home", icon: Home, label: "홈", page: "home" },
      { id: "content-explore", icon: Sparkles, label: "요즘 뜨는 콘텐츠", page: "content-explore" },
      { id: "saved-templates", icon: Bookmark, label: "저장한 콘텐츠", page: "saved-templates" },
      { id: "persona-list", icon: User, label: "내 페르소나", page: "persona-list" },
    ],
    [],
  );

  const bottomItems = useMemo(
    () => [
      { id: "settings", icon: Settings, label: "설정", page: "settings" },
      { id: "help", icon: HelpCircle, label: "고객지원", page: "help" },
      ...(isLoggedIn ? [{ id: "logout", icon: LogOut, label: "로그아웃", action: handleLogout }] : []),
    ],
    [isLoggedIn, handleLogout],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 top-0 flex w-[min(86vw,330px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[64px] items-center justify-between border-b border-gray-100 px-5">
          <h2 className="font-['NEXON_Football_Gothic'] text-[19px] font-bold text-black">메뉴</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        {isLoggedIn ? (
          <div className="border-b border-gray-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#111827] to-[#374151]">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-['NEXON_Football_Gothic'] text-[16px] font-bold text-black">{displayName}</p>
                {displayEmail ? (
                  <p className="truncate font-['Noto_Sans_KR'] text-[12px] text-gray-500">{displayEmail}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-gray-100 px-5 py-5">
            <button
              type="button"
              onClick={() => handleNavigate("login")}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-black font-['NEXON_Football_Gothic'] text-[14px] font-bold text-white transition-colors hover:bg-gray-800"
            >
              <LogIn className="h-4 w-4" />
              로그인 / 회원가입
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavigate(item.page)}
              className={`flex h-[52px] w-full items-center gap-3 px-5 transition-colors ${
                currentPage === item.page ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left font-['Noto_Sans_KR'] text-[15px] font-medium">{item.label}</span>
              {currentPage === item.page ? <div className="h-6 w-1 rounded-full bg-black" /> : null}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 py-2">
          {bottomItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => (item.action ? item.action() : handleNavigate(item.page || ""))}
              className="flex h-[48px] w-full items-center gap-3 px-5 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left font-['Noto_Sans_KR'] text-[14px]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-center font-['Noto_Sans_KR'] text-[11px] text-gray-400">Person:a v1.0.0</p>
        </div>
      </div>
    </div>
  );
}


