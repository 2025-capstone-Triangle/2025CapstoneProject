import { X, Home, Sparkles, Bookmark, User, Settings, HelpCircle, LogOut, LogIn } from 'lucide-react';
import { useMemo, useEffect, useRef, useState, useCallback } from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function HamburgerMenu({ isOpen, onClose, onNavigate, currentPage }: HamburgerMenuProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Check login status from localStorage
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, [isOpen]);

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
    }, 300); // Match the animation duration
  }, [onClose]);

  const handleNavigate = useCallback((page: string) => {
    onNavigate?.(page);
    handleClose();
  }, [onNavigate, handleClose]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    handleNavigate('home');
  }, [handleNavigate]);

  const menuItems = useMemo(() => ([
    { id: 'home', icon: Home, label: '홈', page: 'home' },
    { id: 'content-explore', icon: Sparkles, label: '요즘 뜨는 컨텐츠', page: 'content-explore' },
    { id: 'saved-templates', icon: Bookmark, label: '저장된 템플릿', page: 'saved-templates' },
    { id: 'persona-list', icon: User, label: '내 페르소나', page: 'persona-list' },
  ]), []);

  const bottomItems = useMemo(() => ([
    { id: 'settings', icon: Settings, label: '설정', page: 'settings' },
    { id: 'help', icon: HelpCircle, label: '고객지원', page: 'help' },
    ...(isLoggedIn ? [{ id: 'logout', icon: LogOut, label: '로그아웃', action: handleLogout }] : []),
  ]), [isLoggedIn, handleLogout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 max-w-[390px] mx-auto">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-gray-100">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black">
            메뉴
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* User Profile Section */}
        {isLoggedIn ? (
          <div className="px-5 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-['NEXON_Football_Gothic'] font-bold text-[16px] text-black">
                  사용자님
                </p>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500">
                  user@example.com
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-6 border-b border-gray-100">
            <button
              type="button"
              onClick={() => handleNavigate('login')}
              className="w-full h-[48px] bg-black text-white rounded-[12px] font-['NEXON_Football_Gothic'] font-bold text-[14px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              로그인 / 회원가입
            </button>
          </div>
        )}

        {/* Main Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavigate(item.page)}
              className={`w-full h-[52px] px-5 flex items-center gap-3 transition-colors ${
                currentPage === item.page
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left font-['Noto_Sans_KR'] text-[15px] font-medium">
                {item.label}
              </span>
              {currentPage === item.page && (
                <div className="w-1 h-6 bg-black rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Bottom Menu Items */}
        <div className="border-t border-gray-100 py-2">
          {bottomItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => item.action ? item.action() : handleNavigate(item.page || '')}
              className="w-full h-[48px] px-5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left font-['Noto_Sans_KR'] text-[14px]">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* App Version */}
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-400 text-center">
            Person:a v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
