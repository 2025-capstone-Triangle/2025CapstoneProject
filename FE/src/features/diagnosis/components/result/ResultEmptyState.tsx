interface ResultEmptyStateProps {
  onRetry?: () => void;
}

export function ResultEmptyState({ onRetry }: ResultEmptyStateProps) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pt-10 sm:px-8 lg:px-10">
      <div className="rounded-[16px] border border-[#f0d0d0] bg-[#fff7f7] p-5">
        <p className="mb-3 font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b]">
          진단 결과 데이터를 불러오지 못했습니다. 입력값을 확인하고 다시 진단해 주세요.
        </p>
        <button
          onClick={onRetry}
          className="h-[40px] rounded-[10px] bg-black px-4 font-['Noto_Sans_KR'] text-[13px] text-white"
        >
          다시 진단하기
        </button>
      </div>
    </div>
  );
}
