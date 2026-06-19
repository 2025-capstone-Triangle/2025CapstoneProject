interface VoiceNextActionBarProps {
  hasRecording: boolean;
  disabled: boolean;
  isRecording?: boolean;
  isRecorderStopping?: boolean;
  onNext?: () => void;
}

export function VoiceNextActionBar({
  hasRecording,
  disabled,
  isRecording = false,
  isRecorderStopping = false,
  onNext,
}: VoiceNextActionBarProps) {
  const helperText = hasRecording
    ? "녹음이 완료되었습니다. 다음 단계로 이동할 수 있습니다."
    : isRecorderStopping
      ? "녹음 파일을 정리하는 중입니다. 잠시만 기다려 주세요."
      : isRecording
        ? "녹음을 완료한 뒤 다음 단계로 이동할 수 있습니다."
        : "음성 녹음은 필수 항목입니다. 녹음을 완료해 주세요.";

  const ctaLabel = hasRecording ? "이 녹음으로 다음 단계" : "먼저 녹음을 완료해 주세요";

  return (
    <div className="p-4 sm:p-5 md:px-10 md:pb-8 md:pt-3">
      <p className="mb-2 px-1 font-['Noto_Sans_KR'] text-[11px] text-[#666]">{helperText}</p>
      <button
        onClick={onNext}
        disabled={disabled}
        className="h-[50px] w-full rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
