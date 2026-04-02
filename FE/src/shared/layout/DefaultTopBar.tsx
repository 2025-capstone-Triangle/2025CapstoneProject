import { Icon } from "@iconify/react";

interface DefaultTopBarProps {
  title?: string;
  onTitleClick?: () => void;
  showNotification?: boolean;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export function DefaultTopBar({
  title = "Person:a",
  onTitleClick,
  showNotification = true,
  onMenuClick,
  onNotificationClick,
}: DefaultTopBarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-[6px] rounded-b-[12px] md:rounded-b-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.08)] md:shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-6 md:px-8 lg:px-10 pt-4 md:pt-5 pb-4 md:pb-5">
        <button 
          type="button"
          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-black/5 shadow-[0_4px_10px_rgba(0,0,0,0.06)] flex items-center justify-center transition-transform duration-300 hover:scale-105" 
          aria-label="메뉴"
          onClick={onMenuClick}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 20 19">
            <path d="M1 1L11 1" stroke="#33302E" strokeLinecap="round" strokeWidth="2" />
            <path d="M1 9L19 9" stroke="#33302E" strokeLinecap="round" strokeWidth="2" />
            <path d="M1 18L19 18" stroke="#33302E" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </button>
        <button type="button" onClick={onTitleClick}>
          <h1 className="font-['Noto_Serif_KR'] font-black text-[22px] md:text-[26px] leading-none tracking-[0.2px] text-[#1a1a1a]">
            {title}
          </h1>
        </button>
        {showNotification ? (
          <button
            type="button"
            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-black/5 shadow-[0_4px_10px_rgba(0,0,0,0.06)] flex items-center justify-center transition-transform duration-300 hover:scale-105"
            aria-label="알림"
            onClick={onNotificationClick}
          >
            <Icon icon="ph:bell-simple" className="w-6 h-6 text-[#1f2937]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF466F]" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </div>
  );
}
