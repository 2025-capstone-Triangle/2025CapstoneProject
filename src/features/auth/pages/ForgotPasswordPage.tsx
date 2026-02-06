import { useState } from 'react';
import { ChevronLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export function ForgotPasswordPage({ onBack, onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // Check if email exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      setError('등록되지 않은 이메일입니다.');
      return;
    }

    // In a real app, send reset email here
    // For demo purposes, we'll just show success
    setSuccess(true);

    // Auto redirect after 3 seconds
    setTimeout(() => {
      onNavigate?.('login');
    }, 3000);
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="h-[56px] flex items-center px-4">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <h1 className="flex-1 text-center font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black pr-9">
            비밀번호 찾기
          </h1>
        </div>
      </div>

      <div className="px-8 pt-12 pb-12">
        {!success ? (
          <>
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[20px] text-black mb-3">
                비밀번호 재설정
              </h2>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-relaxed">
                가입하신 이메일 주소를 입력하시면<br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className={`w-full h-[52px] bg-[#f8f8f8] rounded-[16px] px-5 font-['Noto_Sans_KR'] text-[14px] text-black placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 ${
                  error ? 'ring-2 ring-red-500' : 'focus:ring-black'
                }`}
              />
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[12px] flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="font-['Noto_Sans_KR'] text-[13px] text-red-700">
                    {error}
                  </span>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetPassword}
              className="w-full bg-black rounded-[16px] h-[52px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white flex items-center justify-center shadow-md mb-4"
            >
              재설정 링크 보내기
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                onClick={() => onNavigate?.('login')}
                className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] hover:text-black transition-colors"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[20px] text-black mb-3">
              이메일을 확인하세요
            </h2>
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-relaxed mb-8">
              <span className="font-semibold text-black">{email}</span>로<br />
              비밀번호 재설정 링크를 보냈습니다.<br />
              이메일을 확인해주세요.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-[12px]">
              <p className="font-['Noto_Sans_KR'] text-[13px] text-blue-800">
                이메일이 오지 않았다면 스팸함을 확인하거나<br />
                다시 시도해주세요.
              </p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b] mt-6">
              3초 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



