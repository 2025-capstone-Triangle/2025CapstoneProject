import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react';
import { signIn, saveAuth } from '../../../lib/auth';

interface LoginPageProps {
  onLogin?: () => void;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onNavigate, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validation
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signIn({ username: email, password });
      saveAuth(data);
      onLogin?.();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : '이메일 또는 비밀번호가 올바르지 않습니다.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="h-[56px] flex items-center px-4">
          <button
            className="w-9 h-9 flex items-center justify-center"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
      
      <div className="px-8 pt-8 flex flex-col">
        {/* Logo/Title */}
        <div className="text-center mb-16">
          <h1 className="font-['Abhaya_Libre_ExtraBold'] text-[48px] text-black mb-4">
            Person:a
          </h1>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            나만의 디지털 페르소나
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-4 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-black"
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              className="absolute right-5 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full bg-black rounded-[16px] h-[52px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white flex items-center justify-center shadow-md mb-4"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>

        {/* Error Messages */}
        {(error || emailError || passwordError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[12px] flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="font-['Noto_Sans_KR'] text-[13px] text-red-700">
              {error || emailError || passwordError}
            </span>
          </div>
        )}

        {/* Forgot Password */}
        <div className="text-center mb-6">
          <button
            onClick={() => onNavigate?.('forgot-password')}
            className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] hover:text-black transition-colors"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">또는</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Social Login */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[52px] font-['Noto_Sans_KR'] text-[14px] text-black flex items-center justify-center">
            Google로 계속하기
          </button>
          <button className="w-full bg-[#FEE500] rounded-[16px] h-[52px] font-['Noto_Sans_KR'] text-[14px] text-black flex items-center justify-center">
            카카오로 계속하기
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
            계정이 없으신가요?{' '}
            <button
              onClick={() => onNavigate?.('signup')}
              className="font-semibold text-black underline"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


