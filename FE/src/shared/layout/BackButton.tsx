import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="mb-2 px-4 md:mb-3 md:px-6 xl:px-8">
      <div className="px-6 pt-1 md:px-8 md:pt-2 lg:px-10">
        <button
          type="button"
          onClick={onClick}
          className="group relative flex h-12 w-12 transform-gpu items-center justify-center overflow-hidden rounded-full border border-[#dbe1e8] bg-white/70 backdrop-blur-md shadow-[0_4px_14px_rgba(15,23,42,0.10)] transition-[transform,border-color,box-shadow,background-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05] hover:border-[#111827]/25 hover:bg-white/90 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 md:h-[52px] md:w-[52px]"
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.7),rgba(255,255,255,0))] opacity-70 transition-opacity duration-250 group-hover:opacity-100" />
          <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/80" />
          <ChevronLeft className="relative h-[19px] w-[19px] text-[#1f2937] transition-[color,transform] duration-250 ease-out group-hover:scale-[1.04] group-hover:text-[#0f172a] md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );
}
