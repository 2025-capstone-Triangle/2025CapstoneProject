import { useState } from "react";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface ForgotPasswordPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export function ForgotPasswordPage({ onBack, onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleResetPassword = () => {
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    // TODO: 서버 비밀번호 재설정 API 연동 전까지 로컬 사용자 확인으로 임시 처리
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((item: { email?: string }) => item.email === email.trim());
    if (!user) {
      setError("등록되지 않은 이메일입니다.");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => onNavigate?.("login"), 3000);
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={() => onNavigate?.("home")} showNotification={false} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      <div className="mx-auto w-full max-w-[520px] px-6 pb-12 pt-4 sm:px-8">
        {!success ? (
          <>
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Mail className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="mb-3 font-['NEXON_Football_Gothic'] text-[20px] font-bold text-black">비밀번호 재설정</h2>
              <p className="font-['Noto_Sans_KR'] text-[14px] leading-relaxed text-[#6b6b6b]">
                가입하신 이메일 주소를 입력하면
                <br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일"
                className={`h-[52px] w-full rounded-[16px] bg-[#f8f8f8] px-5 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 ${
                  error ? "ring-2 ring-red-500" : "focus:ring-black"
                }`}
              />
              {error ? (
                <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span className="font-['Noto_Sans_KR'] text-[13px] text-red-700">{error}</span>
                </div>
              ) : null}
            </div>

            <button
              onClick={handleResetPassword}
              className="mb-4 flex h-[52px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white shadow-md"
            >
              재설정 링크 보내기
            </button>

            <div className="text-center">
              <button
                onClick={() => onNavigate?.("login")}
                className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] transition-colors hover:text-black"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-3 font-['NEXON_Football_Gothic'] text-[20px] font-bold text-black">이메일을 확인해 주세요</h2>
            <p className="mb-8 font-['Noto_Sans_KR'] text-[14px] leading-relaxed text-[#6b6b6b]">
              <span className="font-semibold text-black">{email}</span>로
              <br />
              비밀번호 재설정 링크를 보냈습니다.
              <br />
              메일함을 확인해 주세요.
            </p>
            <div className="rounded-[12px] border border-blue-200 bg-blue-50 p-4">
              <p className="font-['Noto_Sans_KR'] text-[13px] text-blue-800">
                이메일이 오지 않았다면 스팸함을 확인하거나
                <br />
                잠시 후 다시 시도해 주세요.
              </p>
            </div>
            <p className="mt-6 font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b]">3초 후 로그인 화면으로 이동합니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
