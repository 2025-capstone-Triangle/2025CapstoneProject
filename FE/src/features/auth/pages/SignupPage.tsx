import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  checkDuplicate,
  requestEmailCode,
  saveAuth,
  signIn,
  signUp,
  verifyEmailCode,
  type SignUpPayload,
} from "../../../lib/auth";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface SignupPageProps {
  onBack?: () => void;
  onSignup?: () => void;
  onNavigate?: (page: string) => void;
}

type SignupStep = "basic" | "birthdate" | "gender" | "occupation";
type GenderOption = "MALE" | "FEMALE" | "ETC";
type OccupationOption = "creator" | "normal";

export function SignupPage({ onBack, onSignup, onNavigate }: SignupPageProps) {
  const [step, setStep] = useState<SignupStep>("basic");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [gender, setGender] = useState<GenderOption | "">("");
  const [occupation, setOccupation] = useState<OccupationOption | "">("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setSingleError = (key: string, value: string) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateBirthValue = () => {
    if (!birthYear || !birthMonth || !birthDay) {
      return "생년월일을 입력해 주세요.";
    }

    if (!/^\d{4}$/.test(birthYear) || !/^\d{1,2}$/.test(birthMonth) || !/^\d{1,2}$/.test(birthDay)) {
      return "올바른 생년월일 형식이 아닙니다.";
    }

    const year = Number(birthYear);
    const month = Number(birthMonth);
    const day = Number(birthDay);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return "올바른 생년월일 형식이 아닙니다.";
    }

    const date = new Date(year, month - 1, day);
    const validDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!validDate) {
      return "존재하지 않는 날짜입니다.";
    }

    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date > normalizedToday) {
      return "미래 날짜는 입력할 수 없습니다.";
    }

    return "";
  };

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeRequired(checked);
    setAgreeMarketing(checked);
  };

  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setSingleError("username", "아이디를 입력해 주세요.");
      return;
    }

    if (username.trim().length < 4) {
      setSingleError("username", "아이디는 4자 이상이어야 합니다.");
      return;
    }

    try {
      const data = await checkDuplicate({ username: username.trim() });
      const exists = typeof data === "boolean" ? data : Object.values(data ?? {}).some(Boolean);
      if (exists) {
        setIsUsernameChecked(false);
        setSingleError("username", "이미 사용 중인 아이디입니다.");
        return;
      }
    } catch {
      setSingleError("username", "중복 확인에 실패했습니다.");
      return;
    }

    setIsUsernameChecked(true);
    clearError("username");
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setSingleError("email", "이메일을 입력해 주세요.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setSingleError("email", "올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      const data = await checkDuplicate({ email: email.trim() });
      const exists = typeof data === "boolean" ? data : Object.values(data ?? {}).some(Boolean);
      if (exists) {
        setSingleError("email", "이미 사용 중인 이메일입니다.");
        return;
      }

      await requestEmailCode(email.trim());
      setIsCodeSent(true);
      clearError("email");
    } catch {
      setSingleError("email", "이메일 인증 요청에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setSingleError("code", "인증번호를 입력해 주세요.");
      return;
    }

    try {
      await verifyEmailCode(email.trim(), verificationCode.trim());
      setIsCodeVerified(true);
      clearError("code");
    } catch {
      setIsCodeVerified(false);
      setSingleError("code", "인증번호가 올바르지 않습니다.");
    }
  };

  const handleBasicNext = () => {
    const nextErrors: Record<string, string> = {};

    if (!username.trim()) {
      nextErrors.username = "아이디를 입력해 주세요.";
    } else if (!isUsernameChecked) {
      nextErrors.username = "아이디 중복 확인을 해주세요.";
    }

    if (!password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (password.length < 6) {
      nextErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "비밀번호 확인을 입력해 주세요.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!email.trim()) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!isCodeVerified) {
      nextErrors.code = "이메일 인증을 완료해 주세요.";
    }

    if (!agreeRequired) {
      nextErrors.terms = "필수 약관에 동의해 주세요.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStep("birthdate");
    }
  };

  const handleFinalSignup = async () => {
    clearError("submit");
    const nextErrors: Record<string, string> = {};
    const birthError = validateBirthValue();
    if (birthError) nextErrors.birth = birthError;

    if (!gender) {
      nextErrors.gender = "성별을 선택해 주세요.";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.birth) {
        setStep("birthdate");
      } else if (nextErrors.gender) {
        setStep("gender");
      }
      return;
    }

    const payload: SignUpPayload = {
      username: username.trim(),
      password,
      email: email.trim(),
      birth: `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`,
      sex: (gender || "ETC") as SignUpPayload["sex"],
      is_creator: occupation === "creator",
    };

    setIsSubmitting(true);
    try {
      await signUp(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입에 실패했습니다.";
      setSingleError("submit", message);
      setIsSubmitting(false);
      return;
    }

    try {
      const auth = await signIn({
        username: payload.username,
        password: payload.password,
      });
      saveAuth(auth, { username: payload.username, email: payload.email });
      onSignup?.();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "회원가입은 완료되었지만 자동 로그인에 실패했습니다. 로그인 화면에서 다시 시도해 주세요.";
      setSingleError("submit", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackStep = () => {
    if (step === "basic") {
      onBack?.();
      return;
    }
    if (step === "birthdate") {
      setStep("basic");
      return;
    }
    if (step === "gender") {
      setStep("birthdate");
      return;
    }
    setStep("gender");
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={() => onNavigate?.("home")} showNotification={false} leftAction="back" onBackClick={handleBackStep} />
      <div className="page-scroll">

      {step === "basic" && (
        <div className="mx-auto w-full max-w-[560px] px-6 pb-12 sm:px-8">
          <h1 className="font-['NEXON_Football_Gothic'] text-[28px] text-black mb-2">회원가입</h1>
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] mb-10">Person:a에 오신 것을 환영합니다</p>

          <div className="space-y-[12px]">
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setIsUsernameChecked(false);
                    clearError("username");
                  }}
                  placeholder="아이디 (4자 이상)"
                  className="flex-1 h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px]"
                />
                <button onClick={handleCheckUsername} className="w-[90px] h-[53px] bg-[#f5f5f5] rounded-[16px] text-[13px]">
                  중복확인
                </button>
              </div>
              {errors.username && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.username}
                </p>
              )}
              {!errors.username && isUsernameChecked && (
                <p className="mt-2 text-[12px] text-[#0f9f53] font-['Noto_Sans_KR']">
                  사용 가능한 아이디입니다.
                </p>
              )}
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setIsCodeSent(false);
                    setIsCodeVerified(false);
                    clearError("email");
                  }}
                  placeholder="이메일"
                  className="flex-1 h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px]"
                />
                <button
                  onClick={handleSendCode}
                  disabled={isCodeSent}
                  className={`w-[90px] h-[53px] rounded-[16px] text-[13px] ${
                    isCodeSent ? "bg-[#e5e5e5] text-[#9b9b9b]" : "bg-[#f5f5f5] text-black"
                  }`}
                >
                  {isCodeSent ? "발송완료" : "인증코드"}
                </button>
              </div>
              {errors.email && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
              {!errors.email && isCodeSent && !isCodeVerified && (
                <p className="mt-2 text-[12px] text-[#0f9f53] font-['Noto_Sans_KR']">
                  인증 코드를 발송했습니다. 메일함을 확인해 주세요.
                </p>
              )}
            </div>

            {isCodeSent && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(event) => {
                      setVerificationCode(event.target.value);
                      clearError("code");
                    }}
                    placeholder="인증번호 입력"
                    className="flex-1 h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px]"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={isCodeVerified}
                    className={`w-[90px] h-[53px] rounded-[16px] text-[13px] ${
                      isCodeVerified ? "bg-[#e5e5e5] text-[#9b9b9b]" : "bg-[#f5f5f5] text-black"
                    }`}
                  >
                    {isCodeVerified ? "인증완료" : "인증하기"}
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.code}
                  </p>
                )}
                {!errors.code && isCodeVerified && (
                  <p className="mt-2 text-[12px] text-[#0f9f53] font-['Noto_Sans_KR']">
                    이메일 인증이 완료되었습니다.
                  </p>
                )}
              </div>
            )}

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  placeholder="비밀번호 (6자 이상)"
                  className="w-full h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 pr-12 font-['Noto_Sans_KR'] text-[15px]"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9b9b]"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearError("confirmPassword");
                  }}
                  placeholder="비밀번호 확인"
                  className="w-full h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 pr-12 font-['Noto_Sans_KR'] text-[15px]"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9b9b]"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={agreeAll} onChange={(event) => handleAgreeAll(event.target.checked)} />
              <span className="font-['Noto_Sans_KR'] text-[14px] font-medium text-black">전체 동의</span>
            </label>

            <div className="h-px bg-[#f0f0f0] my-3" />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeRequired}
                onChange={(event) => {
                  setAgreeRequired(event.target.checked);
                  if (!event.target.checked) setAgreeAll(false);
                }}
              />
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                <span className="text-black">[필수]</span> 이용약관 및 개인정보 처리방침
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(event) => {
                  setAgreeMarketing(event.target.checked);
                  if (!event.target.checked) setAgreeAll(false);
                }}
              />
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">[선택] 마케팅 정보 수신 동의</span>
            </label>

            {errors.terms && (
              <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.terms}
              </p>
            )}
            {errors.submit && (
              <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.submit}
              </p>
            )}
          </div>

          <button
            onClick={handleBasicNext}
            disabled={!agreeRequired}
            className="w-full bg-black rounded-[16px] h-[54px] font-['NEXON_Football_Gothic'] text-[16px] text-white flex items-center justify-center mt-10 mb-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            다음
          </button>

          {!agreeRequired && (
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666] mb-4">
              필수 이용약관 동의 후 다음 단계로 이동할 수 있어요.
            </p>
          )}

          <div className="text-center">
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              이미 계정이 있으신가요?{" "}
              <button onClick={() => onNavigate?.("login")} className="text-black underline">
                로그인
              </button>
            </p>
          </div>
        </div>
      )}

      {step === "birthdate" && (
        <div className="mx-auto w-full max-w-[560px] px-6 pb-12 pt-10 sm:px-8 sm:pt-16">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-16">생년월일을 입력해 주세요</h2>

          <div className="flex gap-2 items-center justify-center mb-40">
            <input
              type="number"
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value.slice(0, 4))}
              placeholder="1990"
              className="w-[100px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 text-center"
            />
            <span>년</span>
            <input
              type="number"
              value={birthMonth}
              onChange={(event) => setBirthMonth(event.target.value.slice(0, 2))}
              placeholder="01"
              className="w-[70px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-3 text-center"
            />
            <span>월</span>
            <input
              type="number"
              value={birthDay}
              onChange={(event) => setBirthDay(event.target.value.slice(0, 2))}
              placeholder="01"
              className="w-[70px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-3 text-center"
            />
            <span>일</span>
          </div>

          {errors.birth && (
            <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center justify-center gap-1 mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.birth}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep("gender")} className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] text-[14px] text-[#6b6b6b]">
              건너뛰기
            </button>
            <button
              onClick={() => {
                const birthError = validateBirthValue();
                if (birthError) {
                  setSingleError("birth", birthError);
                  return;
                }
                clearError("birth");
                setStep("gender");
              }}
              className="px-8 h-[46px] bg-black rounded-[16px] text-[14px] text-white"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === "gender" && (
        <div className="mx-auto w-full max-w-[560px] px-6 pb-12 pt-10 sm:px-8 sm:pt-16">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-12">성별을 선택해 주세요</h2>

          <div className="space-y-3 mb-40">
            <button
              onClick={() => setGender("MALE")}
              className={`w-full h-[54px] ${gender === "MALE" ? "bg-black text-white" : "bg-white border border-[#d9d9d9] text-black"} rounded-[16px]`}
            >
              남성
            </button>
            <button
              onClick={() => setGender("FEMALE")}
              className={`w-full h-[54px] ${gender === "FEMALE" ? "bg-black text-white" : "bg-white border border-[#d9d9d9] text-black"} rounded-[16px]`}
            >
              여성
            </button>
            <button
              onClick={() => setGender("ETC")}
              className={`w-full h-[54px] ${gender === "ETC" ? "bg-black text-white" : "bg-white border border-[#d9d9d9] text-black"} rounded-[16px]`}
            >
              기타
            </button>
          </div>

          {errors.gender && (
            <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center justify-center gap-1 mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.gender}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep("occupation")} className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] text-[14px] text-[#6b6b6b]">
              건너뛰기
            </button>
            <button onClick={() => setStep("occupation")} className="px-8 h-[46px] bg-black rounded-[16px] text-[14px] text-white">
              다음
            </button>
          </div>
        </div>
      )}

      {step === "occupation" && (
        <div className="mx-auto w-full max-w-[560px] px-6 pb-12 pt-10 sm:px-8 sm:pt-16">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-12">직업유형을 선택해 주세요</h2>

          <div className="space-y-3 mb-40">
            <button
              onClick={() => setOccupation("creator")}
              className={`w-full h-[54px] ${occupation === "creator" ? "bg-black text-white" : "bg-white border border-[#d9d9d9] text-black"} rounded-[16px]`}
            >
              크리에이터
            </button>
            <button
              onClick={() => setOccupation("normal")}
              className={`w-full h-[54px] ${occupation === "normal" ? "bg-black text-white" : "bg-white border border-[#d9d9d9] text-black"} rounded-[16px]`}
            >
              일반 사용자
            </button>
          </div>

          {errors.submit && (
            <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center justify-center gap-1 mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.submit}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={handleFinalSignup} className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] text-[14px] text-[#6b6b6b]">
              건너뛰기
            </button>
            <button
              onClick={handleFinalSignup}
              disabled={isSubmitting}
              className="px-8 h-[46px] bg-black rounded-[16px] text-[14px] text-white disabled:opacity-70"
            >
              {isSubmitting ? "처리 중..." : "완료"}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
