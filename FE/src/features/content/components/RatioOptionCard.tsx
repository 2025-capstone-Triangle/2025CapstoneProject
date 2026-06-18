import { Check } from "lucide-react";

interface RatioOptionCardProps {
  ratio: {
    id: string;
    label: string;
    description: string;
    detail: string;
    aspectClass: string;
    platform?: string;
  };
  selected: boolean;
  onSelect: (ratioId: string) => void;
}

export function RatioOptionCard({ ratio, selected, onSelect }: RatioOptionCardProps) {
  return (
    <button
      onClick={() => onSelect(ratio.id)}
      className={`group w-full rounded-[18px] border p-4 text-left transition-all duration-200 md:p-5 ${
        selected
          ? "border-[#111827] bg-white shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
          : "border-[#e7ebf0] bg-white hover:border-[#cfd8e3] hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-end gap-2">
            <h3 className="font-['Noto_Sans_KR'] text-[23px] font-bold leading-none tracking-[-0.01em] text-[#0f172a] md:text-[24px]">
              {ratio.label}
            </h3>
            <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold text-[#64748b] md:text-[13px]">
              {ratio.description}
            </span>
          </div>
          <p className="font-['Noto_Sans_KR'] text-[12px] text-[#94a3b8] md:text-[13px]">{ratio.detail}</p>
        </div>
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
            selected ? "border-black bg-black text-white" : "border-[#cbd5e1] bg-white text-transparent"
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
        </div>
      </div>
    </button>
  );
}
