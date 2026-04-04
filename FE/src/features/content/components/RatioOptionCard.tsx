interface RatioOptionCardProps {
  ratio: {
    id: string;
    label: string;
    description: string;
    detail: string;
    aspectClass: string;
  };
  selected: boolean;
  onSelect: (ratioId: string) => void;
}

export function RatioOptionCard({ ratio, selected, onSelect }: RatioOptionCardProps) {
  const previewClassName =
    ratio.id === "1:1"
      ? "aspect-square"
      : ratio.id === "4:5"
        ? "aspect-[4/5]"
        : "aspect-[9/16]";

  return (
    <button
      onClick={() => onSelect(ratio.id)}
      className={`w-full rounded-[18px] p-4 flex items-center gap-3 transition-all ${
        selected ? "bg-black shadow-lg" : "bg-[#f8f8f8] hover:bg-[#f0f0f0]"
      }`}
    >
      <div className="flex h-11 w-[74px] flex-shrink-0 items-center justify-center rounded-[10px] bg-white">
        <div
          className={`${previewClassName} w-full max-w-[32px] rounded-[4px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0]`}
        />
      </div>

      <div className="flex-1 text-left">
        <div className="mb-0.5 flex items-baseline gap-2">
          <h3
            className={`font-['NEXON_Football_Gothic'] text-[19px] font-bold ${
              selected ? "text-white" : "text-black"
            }`}
          >
            {ratio.label}
          </h3>
          <span
            className={`font-['Noto_Sans_KR'] text-[13px] ${
              selected ? "text-white/80" : "text-[#6b6b6b]"
            }`}
          >
            {ratio.description}
          </span>
        </div>
        <p
          className={`font-['Noto_Sans_KR'] text-[12px] ${
            selected ? "text-white/70" : "text-[#999999]"
          }`}
        >
          {ratio.detail}
        </p>
      </div>

      <div
        className={`h-6 w-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-white bg-white" : "border-[#c0c0c0]"
        }`}
      >
        {selected ? <div className="h-3 w-3 rounded-full bg-black" /> : null}
      </div>
    </button>
  );
}
