import { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { checkDuplicate, signUp } from '../../../lib/auth';

interface SignupPageProps {
  onBack?: () => void;
  onSignup?: () => void;
  onNavigate?: (page: string) => void;
}

type SignupStep = 'basic' | 'birthdate' | 'gender' | 'occupation';

export function SignupPage({ onBack, onSignup, onNavigate }: SignupPageProps) {
  const [step, setStep] = useState<SignupStep>('basic');
  
  // Basic info state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Additional info state
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeRequired(checked);
    setAgreeMarketing(checked);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckUsername = async () => {
    if (!username) {
      setErrors({ ...errors, username: '아이디를 입력해주세요.' });
      return;
    }
    
    if (username.length < 4) {
      setErrors({ ...errors, username: '아이디는 4자 이상이어야 합니다.' });
      return;
    }
    
    try {
      const data = await checkDuplicate({ username });
      const exists =
        typeof data === 'boolean'
          ? data
          : Object.values(data ?? {}).some(Boolean);
      if (exists) {
        setIsUsernameChecked(false);
        setErrors({ ...errors, username: '이미 사용 중인 아이디입니다.' });
        return;
      }
    } catch {
      setErrors({ ...errors, username: '중복 확인에 실패했습니다.' });
      return;
    }

    setIsUsernameChecked(true);
    const newErrors = { ...errors };
    delete newErrors.username;
    setErrors(newErrors);
  };

  const handleSendCode = async () => {
    if (!email) {
      setErrors({ ...errors, email: '이메일을 입력해주세요.' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: '올바른 이메일 형식이 아닙니다.' });
      return;
    }
    
    try {
      const data = await checkDuplicate({ email });
      const exists =
        typeof data === 'boolean'
          ? data
          : Object.values(data ?? {}).some(Boolean);
      if (exists) {
        setErrors({ ...errors, email: '이미 사용 중인 이메일입니다.' });
        return;
      }
    } catch {
      setErrors({ ...errors, email: '이메일 확인에 실패했습니다.' });
      return;
    }
    
    setIsCodeSent(true);
    const newErrors = { ...errors };
    delete newErrors.email;
    setErrors(newErrors);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      setErrors({ ...errors, code: '인증번호를 입력해주세요.' });
      return;
    }
    
    if (verificationCode.length < 4) {
      setErrors({ ...errors, code: '올바른 인증번호를 입력해주세요.' });
      return;
    }
    
    setIsCodeVerified(true);
    const newErrors = { ...errors };
    delete newErrors.code;
    setErrors(newErrors);
  };

  const handleBasicNext = () => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = '아이디를 입력해주세요.';
    } else if (!isUsernameChecked) {
      newErrors.username = '아이디 중복확인을 해주세요.';
    }
    
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!isCodeVerified) {
      newErrors.code = '이메일 인증을 완료해주세요.';
    }
    
    if (!agreeRequired) {
      newErrors.terms = '필수 약관에 동의해주세요.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep('birthdate');
    }
  };

  const handleFinalSignup = async () => {
    const newErrors: Record<string, string> = {};
    if (!birthYear || !birthMonth || !birthDay) {
      newErrors.birth = '생년월일을 입력해주세요.';
    }
    if (!gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...errors, ...newErrors });
      return;
    }

    const birth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    const sex = gender === '남성' ? 'MALE' : 'FEMALE';
    const is_creator = occupation === '크리에이터';

    setIsSubmitting(true);
    try {
      await signUp({
        username,
        password,
        email,
        birth,
        sex,
        is_creator,
      });
      onSignup?.();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : '회원가입에 실패했습니다.';
      setErrors({ ...errors, submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackStep = () => {
    if (step === 'basic') {
      onBack?.();
    } else if (step === 'birthdate') {
      setStep('basic');
    } else if (step === 'gender') {
      setStep('birthdate');
    } else if (step === 'occupation') {
      setStep('gender');
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="h-[56px] flex items-center px-4">
          <button
            className="w-9 h-9 flex items-center justify-center"
            onClick={handleBackStep}
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 'basic' && (
        <div className="px-6 pb-12">
          <h1 className="font-['NEXON_Football_Gothic'] text-[28px] text-black mb-2">
            회원가입
          </h1>
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] mb-10">
            Person:a에 오신 것을 환영합니다!
          </p>

          <div className="space-y-[12px]">
            {/* Username */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setIsUsernameChecked(false);
                  }}
                  placeholder="아이디 (4자 이상)"
                  className={`flex-1 h-[53px] bg-white border ${
                    errors.username ? 'border-red-500' : 'border-[#d9d9d9]'
                  } rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none focus:border-black transition-colors`}
                />
                <button
                  onClick={handleCheckUsername}
                  className="w-[90px] h-[53px] bg-[#f5f5f5] rounded-[16px] font-['Noto_Sans_KR'] text-[13px] text-black flex-shrink-0"
                >
                  중복확인
                </button>
              </div>
              {errors.username && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsCodeSent(false);
                    setIsCodeVerified(false);
                  }}
                  placeholder="이메일"
                  className={`flex-1 h-[53px] bg-white border ${
                    errors.email ? 'border-red-500' : 'border-[#d9d9d9]'
                  } rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none focus:border-black transition-colors`}
                />
                <button
                  onClick={handleSendCode}
                  disabled={isCodeSent}
                  className={`w-[90px] h-[53px] rounded-[16px] font-['Noto_Sans_KR'] text-[13px] flex-shrink-0 ${
                    isCodeSent ? 'bg-[#e5e5e5] text-[#9b9b9b]' : 'bg-[#f5f5f5] text-black'
                  }`}
                >
                  {isCodeSent ? '발송완료' : '인증코드'}
                </button>
              </div>
              {errors.email && (
                <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Verification Code */}
            {isCodeSent && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 입력"
                    className={`flex-1 h-[53px] bg-white border ${
                      errors.code ? 'border-red-500' : 'border-[#d9d9d9]'
                    } rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none focus:border-black transition-colors`}
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={isCodeVerified}
                    className={`w-[90px] h-[53px] rounded-[16px] font-['Noto_Sans_KR'] text-[13px] flex-shrink-0 ${
                      isCodeVerified ? 'bg-[#e5e5e5] text-[#9b9b9b]' : 'bg-[#f5f5f5] text-black'
                    }`}
                  >
                    {isCodeVerified ? '인증완료' : '인증하기'}
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-2 text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.code}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  className={`w-full h-[53px] bg-white border ${
                    errors.password ? 'border-red-500' : 'border-[#d9d9d9]'
                  } rounded-[16px] px-4 pr-12 font-['Noto_Sans_KR'] text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none focus:border-black transition-colors`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9b9b]"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 확인"
                  className={`w-full h-[53px] bg-white border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#d9d9d9]'
                  } rounded-[16px] px-4 pr-12 font-['Noto_Sans_KR'] text-[15px] text-black placeholder:text-[#9b9b9b] focus:outline-none focus:border-black transition-colors`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b9b9b]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          {/* Terms Agreement */}
          <div className="mt-8 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={agreeAll}
                  onChange={(e) => handleAgreeAll(e.target.checked)}
                  className="w-5 h-5 border-2 border-[#d9d9d9] rounded appearance-none checked:bg-black checked:border-black cursor-pointer"
                />
                {agreeAll && (
                  <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-['Noto_Sans_KR'] text-[14px] font-medium text-black">
                전체 동의
              </span>
            </label>
            
            <div className="h-px bg-[#f0f0f0] my-3" />
            
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={agreeRequired}
                    onChange={(e) => setAgreeRequired(e.target.checked)}
                    className="w-5 h-5 border-2 border-[#d9d9d9] rounded appearance-none checked:bg-black checked:border-black cursor-pointer"
                  />
                  {agreeRequired && (
                    <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                  <span className="text-black">[필수]</span> 이용약관 및 개인정보처리방침
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(e) => setAgreeMarketing(e.target.checked)}
                    className="w-5 h-5 border-2 border-[#d9d9d9] rounded appearance-none checked:bg-black checked:border-black cursor-pointer"
                  />
                  {agreeMarketing && (
                    <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                  [선택] 마케팅 정보 수신 동의
                </span>
              </label>
            </div>
            
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

          {/* Next Button */}
          <button
            onClick={handleBasicNext}
            className="w-full bg-black rounded-[16px] h-[54px] font-['NEXON_Football_Gothic'] text-[16px] text-white flex items-center justify-center mt-10 mb-6"
          >
            다음
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => onNavigate?.('login')}
                className="text-black underline"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Birthdate */}
      {step === 'birthdate' && (
        <div className="px-[42px] pt-20 pb-12">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-16">
            생년월일을 입력해주세요
          </h2>

          <div className="flex gap-2 items-center justify-center mb-40">
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.slice(0, 4))}
              placeholder="1990"
              className="w-[100px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-4 font-['Noto_Sans_KR'] text-[16px] text-black text-center placeholder:text-[#d9d9d9] focus:outline-none focus:border-black transition-colors"
            />
            <span className="font-['Noto_Sans_KR'] text-[16px] text-black">년</span>
            <input
              type="number"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value.slice(0, 2))}
              placeholder="01"
              className="w-[70px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-3 font-['Noto_Sans_KR'] text-[16px] text-black text-center placeholder:text-[#d9d9d9] focus:outline-none focus:border-black transition-colors"
            />
            <span className="font-['Noto_Sans_KR'] text-[16px] text-black">월</span>
            <input
              type="number"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value.slice(0, 2))}
              placeholder="01"
              className="w-[70px] h-[53px] bg-white border border-[#d9d9d9] rounded-[16px] px-3 font-['Noto_Sans_KR'] text-[16px] text-black text-center placeholder:text-[#d9d9d9] focus:outline-none focus:border-black transition-colors"
            />
            <span className="font-['Noto_Sans_KR'] text-[16px] text-black">일</span>
          </div>
          {errors.birth && (
            <p className="text-[12px] text-red-500 font-['Noto_Sans_KR'] flex items-center justify-center gap-1 mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.birth}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('gender')}
              className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]"
            >
              건너뛰기
            </button>
            <button
              onClick={() => setStep('gender')}
              className="px-8 h-[46px] bg-black rounded-[16px] font-['NEXON_Football_Gothic'] text-[14px] text-white"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Gender */}
      {step === 'gender' && (
        <div className="px-[60px] pt-20 pb-12">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-12">
            성별을 선택해주세요
          </h2>

          <div className="space-y-3 mb-40">
            <button
              onClick={() => setGender('여성')}
              className={`w-full h-[54px] ${
                gender === '여성' ? 'bg-black text-white' : 'bg-white border border-[#d9d9d9] text-black'
              } rounded-[16px] font-['Noto_Sans_KR'] text-[15px] transition-all`}
            >
              여성
            </button>
            <button
              onClick={() => setGender('남성')}
              className={`w-full h-[54px] ${
                gender === '남성' ? 'bg-black text-white' : 'bg-white border border-[#d9d9d9] text-black'
              } rounded-[16px] font-['Noto_Sans_KR'] text-[15px] transition-all`}
            >
              남성
            </button>
            <button
              onClick={() => setGender('기타')}
              className={`w-full h-[54px] ${
                gender === '기타' ? 'bg-black text-white' : 'bg-white border border-[#d9d9d9] text-black'
              } rounded-[16px] font-['Noto_Sans_KR'] text-[15px] transition-all`}
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
            <button
              onClick={() => setStep('occupation')}
              className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]"
            >
              건너뛰기
            </button>
            <button
              onClick={() => setStep('occupation')}
              className="px-8 h-[46px] bg-black rounded-[16px] font-['NEXON_Football_Gothic'] text-[14px] text-white"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Occupation */}
      {step === 'occupation' && (
        <div className="px-[60px] pt-20 pb-12">
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black text-center mb-12">
            직업유형을 선택해주세요
          </h2>

          <div className="space-y-3 mb-40">
            <button
              onClick={() => setOccupation('크리에이터')}
              className={`w-full h-[54px] ${
                occupation === '크리에이터' ? 'bg-black text-white' : 'bg-white border border-[#d9d9d9] text-black'
              } rounded-[16px] font-['Noto_Sans_KR'] text-[15px] transition-all`}
            >
              크리에이터
            </button>
            <button
              onClick={() => setOccupation('일반인')}
              className={`w-full h-[54px] ${
                occupation === '일반인' ? 'bg-black text-white' : 'bg-white border border-[#d9d9d9] text-black'
              } rounded-[16px] font-['Noto_Sans_KR'] text-[15px] transition-all`}
            >
              일반인
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleFinalSignup}
              className="px-8 h-[46px] bg-[#f5f5f5] rounded-[16px] font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]"
            >
              건너뛰기
            </button>
          <button
            onClick={handleFinalSignup}
            disabled={isSubmitting}
            className="px-8 h-[46px] bg-black rounded-[16px] font-['NEXON_Football_Gothic'] text-[14px] text-white"
          >
            {isSubmitting ? '처리 중...' : '완료'}
          </button>
          </div>
        </div>
      )}
    </div>
  );
}


