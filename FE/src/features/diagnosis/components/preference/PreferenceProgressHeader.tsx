interface PreferenceProgressHeaderProps {
  stepIndex: number;
  totalSteps: number;
  selectedCount: number;
  compact?: boolean;
}

export function PreferenceProgressHeader({
  stepIndex,
  totalSteps,
  selectedCount,
  compact = false,
}: PreferenceProgressHeaderProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className={compact ? "mb-2" : "mb-6"}>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">
          {stepIndex + 1} / {totalSteps}
        </p>
        <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">이미지 선택 {selectedCount}/6</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#efefef]">
        <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
