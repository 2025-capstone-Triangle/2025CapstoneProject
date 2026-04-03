interface VoiceNextActionBarProps {
  hasRecording: boolean;
  disabled: boolean;
  onNext?: () => void;
}

export function VoiceNextActionBar({ hasRecording, disabled, onNext }: VoiceNextActionBarProps) {
  return (
    <div className="p-4 sm:p-5 md:px-10 md:pb-8 md:pt-3">
      <p className="mb-2 px-1 font-['Noto_Sans_KR'] text-[11px] text-[#666]">
        {hasRecording
          ? "현재 녹음본이 선택되어 있으며 다음 단계에서 그대로 사용됩니다."
          : "음성 녹음은 필수 항목입니다. 녹음을 완료해야 다음 단계로 이동할 수 있습니다."}
      </p>
      <button
        onClick={onNext}
        disabled={disabled}
        className="h-[50px] w-full rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {hasRecording ? "이 녹음으로 다음" : "녹음 후 다음"}
      </button>
    </div>
  );
}
