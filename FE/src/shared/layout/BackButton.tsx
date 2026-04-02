import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="px-6 md:px-8 lg:px-10 mb-4 md:mb-5">
      <button 
        type="button"
        onClick={onClick}
        className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-white border border-[#e5e5e5] rounded-full hover:border-black hover:bg-[#fafafa] transition-all shadow-sm group"
      >
        <ChevronLeft className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#6b6b6b] group-hover:text-black transition-colors" />
      </button>
    </div>
  );
}
