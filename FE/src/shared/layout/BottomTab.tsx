import icons from "../icons/app-icons";

interface BottomTabProps {
  activeTab?: 'home' | 'persona' | 'content';
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
}

export function BottomTab({ activeTab = 'home', onTabChange }: BottomTabProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_0_3px_rgba(0,0,0,0.15)] h-[51px] flex items-center justify-center z-50">
      <div className="flex items-center gap-[99px]">
        <button 
          type="button"
          className="w-[21px] h-[22px]"
          onClick={() => onTabChange?.('home')}
          aria-label="홈"
        >
          <svg className="size-full" fill="none" viewBox="0 0 21 22">
            <path d={icons.home} fill={activeTab === 'home' ? 'black' : '#E6E8EC'} />
          </svg>
        </button>
        <button 
          type="button"
          className="w-[22.8px] h-[23px]"
          onClick={() => onTabChange?.('content')}
          aria-label="콘텐츠"
        >
          <svg className="size-full" fill="none" viewBox="0 0 22.8094 23">
            <path d={icons.search} fill={activeTab === 'content' ? 'black' : '#E6E8EC'} />
          </svg>
        </button>
        <button 
          type="button"
          className="w-[19.14px] h-[23.18px]"
          onClick={() => onTabChange?.('persona')}
          aria-label="마이 페르소나"
        >
          <svg className="size-full" fill="none" viewBox="0 0 19.14 23.1821">
            <path clipRule="evenodd" d={icons.user} fill={activeTab === 'persona' ? 'black' : '#E6E8EC'} fillRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
