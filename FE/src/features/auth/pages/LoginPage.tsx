import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react';
import { getMemberInfo, signIn, saveAuth } from '../../../lib/auth';

interface LoginPageProps {
  onLogin?: () => void;
  onAdminLogin?: () => void;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onAdminLogin, onNavigate, onBack }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    // Reset errors
    setError('');
    setUserIdError('');
    setPasswordError('');

    // Validation
    if (!userId.trim()) {
      setUserIdError('?�이?��? ?�력?�주?�요.');
      return;
    }
    if (!password) {
      setPasswordError('비�?번호�??�력?�주?�요.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('비�?번호??6???�상?�어???�니??');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signIn({ username: userId, password });
      const normalized = userId.trim();
      try {
        const member = await getMemberInfo();
        saveAuth(data, { username: member.username ?? normalized, email: member.email });
      } catch {
        saveAuth(data, { username: normalized });
      }
      if (normalized === 'admin') {
        onAdminLogin?.();
      } else {
        onLogin?.();
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : '?�이???�는 비�?번호가 ?�바르�? ?�습?�다.';
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
            ?�만???��????�르?�나
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="아이디"
            className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="비밀번호"
              className="w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 pr-12 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-black"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {(error || userIdError || passwordError) && (
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-['Noto_Sans_KR'] text-[13px]">
                {error || userIdError || passwordError}
              </span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-[16px] bg-black text-white font-['Noto_Sans_KR'] text-[15px] disabled:opacity-60"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => onAdminLogin?.()}
            className="w-full h-[52px] rounded-[16px] border border-black text-black font-['Noto_Sans_KR'] text-[14px]"
          >
            관리자 페이지 (임시)
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-center mb-6">
          <button
            onClick={() => onNavigate?.('forgot-password')}
            className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] hover:text-black transition-colors"
          >
            비�?번호�??�으?�나??
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">?�는</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>

        {/* Social Login */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[52px] font-['Noto_Sans_KR'] text-[14px] text-black flex items-center justify-center">
            Google�?계속?�기
          </button>
          <button className="w-full bg-[#FEE500] rounded-[16px] h-[52px] font-['Noto_Sans_KR'] text-[14px] text-black flex items-center justify-center">
            카카?�로 계속?�기
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
            계정???�으?��???{' '}
            <button
              onClick={() => onNavigate?.('signup')}
              className="font-semibold text-black underline"
            >
              ?�원가??
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}



