import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="px-8 mb-4">
      <button 
        type="button"
        onClick={onClick}
        className="flex items-center justify-center w-10 h-10 bg-white border border-[#e5e5e5] rounded-full hover:border-black hover:bg-[#fafafa] transition-all shadow-sm group"
      >
        <ChevronLeft className="w-5 h-5 text-[#6b6b6b] group-hover:text-black transition-colors" />
      </button>
    </div>
  );
}
