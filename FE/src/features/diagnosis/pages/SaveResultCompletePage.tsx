import { Check } from "lucide-react";
import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";

interface SaveResultCompletePageProps {
  onGoToPersona?: () => void;
  onCreateContent?: () => void;
  onHome?: () => void;
  onBack?: () => void;
}

export function SaveResultCompletePage({
  onGoToPersona,
  onCreateContent,
  onHome,
  onBack,
}: SaveResultCompletePageProps) {
  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[980px]"
      contentClassName="px-5 pb-10 pt-2 sm:px-8 md:px-10"
    >
      <div className="mx-auto flex h-full w-full max-w-[640px] flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-[#EF466F] shadow-lg md:h-32 md:w-32">
          <Check className="h-14 w-14 text-white md:h-16 md:w-16" strokeWidth={3} />
        </div>

        <h2 className="mb-3 font-['NEXON_Football_Gothic'] text-[30px] font-bold leading-tight text-black md:text-[34px]">
          페르소나 저장 완료!
        </h2>
        <p className="mb-10 font-['Noto_Sans_KR'] text-[15px] leading-[1.7] text-[#6b6b6b] md:text-[16px]">
          이제 당신만의 페르소나로
          <br />
          콘텐츠를 바로 만들어보세요.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={onCreateContent}
            className="flex h-[56px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a]"
          >
            콘텐츠 만들기
          </button>
          <button
            onClick={onGoToPersona}
            className="flex h-[56px] w-full items-center justify-center rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[16px] font-semibold text-black transition-colors hover:bg-[#f8f8f8]"
          >
            페르소나 보기
          </button>
          <button
            onClick={onHome}
            className="flex h-[56px] w-full items-center justify-center rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[16px] font-semibold text-black transition-colors hover:bg-[#f8f8f8]"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </DiagnosisPageLayout>
  );
}
