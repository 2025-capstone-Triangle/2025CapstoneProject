import { ChevronLeft, ChevronRight, User, Bell, Lock, Globe, Palette, Trash2, LogOut } from 'lucide-react';

interface SettingsPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

function SettingsTopBar({ onBack }: { onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="h-[56px] flex items-center px-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="flex-1 text-center font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black pr-9">
          설정
        </h1>
      </div>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
  danger?: boolean;
}

function SettingItem({ icon: Icon, label, description, onClick, danger }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        danger ? 'bg-red-50' : 'bg-gray-100'
      }`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-gray-700'}`} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-['Noto_Sans_KR'] text-[15px] font-medium ${
          danger ? 'text-red-600' : 'text-black'
        }`}>
          {label}
        </p>
        {description && (
          <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <ChevronRight className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-gray-400'}`} />
    </button>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="px-6 py-3 font-['NEXON_Football_Gothic'] font-bold text-[13px] text-gray-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className="bg-white border-y border-gray-100">
        {children}
      </div>
    </div>
  );
}

export function SettingsPage({ onBack, onNavigate }: SettingsPageProps) {
  const handleLogout = () => {
    const confirmed = confirm('로그아웃 하시겠습니까?');
    if (confirmed) {
      localStorage.removeItem('user');
      onNavigate?.('home');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');
    if (confirmed) {
      localStorage.clear();
      onNavigate?.('home');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen max-w-[390px] mx-auto">      <SettingsTopBar onBack={onBack} />
      
      <div className="py-4">
        <SettingSection title="계정">
          <SettingItem
            icon={User}
            label="프로필 편집"
            description="이름, 이메일 변경"
            onClick={() => alert('프로필 편집 기능 (준비중)')}
          />
          <SettingItem
            icon={Lock}
            label="비밀번호 변경"
            onClick={() => alert('비밀번호 변경 기능 (준비중)')}
          />
        </SettingSection>

        <SettingSection title="알림">
          <SettingItem
            icon={Bell}
            label="푸시 알림"
            description="새로운 템플릿 및 업데이트 알림"
            onClick={() => alert('알림 설정 기능 (준비중)')}
          />
        </SettingSection>

        <SettingSection title="앱 설정">
          <SettingItem
            icon={Globe}
            label="언어"
            description="한국어"
            onClick={() => alert('언어 설정 기능 (준비중)')}
          />
          <SettingItem
            icon={Palette}
            label="테마"
            description="라이트 모드"
            onClick={() => alert('테마 설정 기능 (준비중)')}
          />
        </SettingSection>

        <SettingSection title="기타">
          <SettingItem
            icon={LogOut}
            label="로그아웃"
            onClick={handleLogout}
          />
          <SettingItem
            icon={Trash2}
            label="계정 삭제"
            description="모든 데이터가 삭제됩니다"
            onClick={handleDeleteAccount}
            danger
          />
        </SettingSection>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-8 text-center">
        <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-400 mb-2">
          Person:a v1.0.0
        </p>
        <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-400">
          © 2025 Person:a. All rights reserved.
        </p>
      </div>
    </div>
  );
}



