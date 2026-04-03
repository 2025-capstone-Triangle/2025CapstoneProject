interface PreferenceStartPanelProps {
  guideText: string;
  onStart: () => void;
}

export function PreferenceStartPanel({ guideText, onStart }: PreferenceStartPanelProps) {
  return (
    <>
      <div className="inline-flex items-center rounded-full bg-black px-3 py-1.5 font-['Noto_Sans_KR'] text-[12px] text-white">
        스타일 선호 테스트 안내
      </div>
      <div className="mt-4 rounded-[18px] border border-[#ececec] bg-[#f7f7f7] p-5">
        <p className="whitespace-pre-line font-['Noto_Sans_KR'] text-[14px] leading-[1.8] text-[#222]">{guideText}</p>
      </div>
      <button
        onClick={onStart}
        className="mt-8 h-[52px] w-full rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white"
      >
        테스트 시작하기
      </button>
    </>
  );
}
