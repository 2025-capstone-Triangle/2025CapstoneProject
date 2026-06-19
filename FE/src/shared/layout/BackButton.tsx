import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="px-1 pb-1 pt-1 md:px-2 md:pt-1.5 lg:px-2">
      <div>
        <button
          type="button"
          onClick={onClick}
          className="group inline-flex h-10 items-center gap-1.5 rounded-[14px] border border-[#e6e9ee] bg-white px-2.5 py-1.5 text-[#334155] shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:border-[#111827]/35 hover:bg-[#111827] hover:text-white hover:shadow-[0_8px_18px_rgba(15,23,42,0.18)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 md:h-11 md:gap-2 md:rounded-[16px] md:px-3"
          aria-label="뒤로가기"
        >
          <ChevronLeft
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 md:h-[18px] md:w-[18px]"
            strokeWidth={2.4}
          />
          <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold leading-none tracking-[-0.01em] md:text-[13px]">
            뒤로
          </span>
        </button>
      </div>
    </div>
  );
}
