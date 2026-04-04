import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";

interface DiagnosisStartPageProps {
  onStart?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function DiagnosisStartPage({ onStart, onBack, onHome }: DiagnosisStartPageProps) {
  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[1160px]"
      contentClassName="px-5 pb-28 pt-2 sm:px-8 md:px-10 md:pb-28 lg:pt-4"
      bottomMaxWidthClassName="max-w-[1160px]"
      bottom={
        <div className="p-4 sm:p-6 md:px-10 md:pb-8 md:pt-4">
          <button
            onClick={onStart}
            className="flex h-[54px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a]"
          >
            시작하기
          </button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr] lg:items-center lg:gap-8">
          <div className="text-center lg:text-left">
            <h1 className="mb-3 font-['NEXON_Football_Gothic'] text-[clamp(32px,4vw,50px)] font-bold leading-[1.14] text-black">
              나만의
              <br />
              페르소나 만들기
            </h1>
            <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.7] text-[#6b6b6b] md:text-[16px]">
              몇 가지 질문과 입력을 통해
              <br />
              당신만의 페르소나를 만들어드려요
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-[16px] bg-[#f4f4f5] p-5 md:col-span-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black">
                <span className="font-['Noto_Sans_KR'] text-[14px] font-semibold text-white">1</span>
              </div>
              <div>
                <h3 className="mb-1 font-['Noto_Sans_KR'] text-[16px] font-semibold text-black">이미지 분석</h3>
                <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.55] text-[#666]">
                  사진을 통해 시각적 인상과 분위기를 분석합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[16px] bg-[#f4f4f5] p-5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black">
                <span className="font-['Noto_Sans_KR'] text-[14px] font-semibold text-white">2</span>
              </div>
              <div>
                <h3 className="mb-1 font-['Noto_Sans_KR'] text-[16px] font-semibold text-black">음성 분석</h3>
                <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.55] text-[#666]">
                  목소리의 톤과 리듬을 분석해 성향을 파악합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[16px] bg-[#f4f4f5] p-5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black">
                <span className="font-['Noto_Sans_KR'] text-[14px] font-semibold text-white">3</span>
              </div>
              <div>
                <h3 className="mb-1 font-['Noto_Sans_KR'] text-[16px] font-semibold text-black">선호 테스트</h3>
                <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.55] text-[#666]">
                  질문 기반 테스트로 원하는 무드와 색감 취향을 반영합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DiagnosisPageLayout>
  );
}
