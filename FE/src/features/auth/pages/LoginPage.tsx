import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { getMemberInfo, saveAuth, signIn } from "../../../lib/auth";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface LoginPageProps {
  onLogin?: () => void;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onNavigate, onBack }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!username.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await signIn({ username: username.trim(), password });
      saveAuth(token);
      try {
        const member = await getMemberInfo();
        saveAuth(token, { username: member.username, email: member.email });
      } catch {
        saveAuth(token, { username: username.trim() });
      }
      onLogin?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={() => onNavigate?.("home")} showNotification={false} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      <div className="mx-auto w-full max-w-[520px] px-6 pb-8 pt-8 sm:px-8">
        <div className="text-center mb-14">
          <h1 className="font-['Abhaya_Libre_ExtraBold'] text-[48px] text-black mb-3">Person:a</h1>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">나만의 페르소나를 만들어 보세요</p>
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="아이디"
            className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="비밀번호"
              className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 pr-12 text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[13px]">{error}</span>
          </div>
        ) : null}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full h-[52px] rounded-[16px] bg-black text-white text-[15px] disabled:opacity-60"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>

        <div className="text-center my-5">
          <button
            onClick={() => onNavigate?.("forgot-password")}
            className="text-[13px] text-[#6b6b6b] hover:text-black"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <div className="text-center">
          <p className="text-[14px] text-[#6b6b6b]">
            계정이 없으신가요?{" "}
            <button onClick={() => onNavigate?.("signup")} className="font-semibold text-black underline">
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
