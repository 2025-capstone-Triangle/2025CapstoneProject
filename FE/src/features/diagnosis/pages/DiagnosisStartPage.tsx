import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';

interface DiagnosisStartPageProps {
  onStart?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function DiagnosisStartPage({ onStart, onBack, onHome }: DiagnosisStartPageProps) {
  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="mx-auto max-w-[860px] px-6 md:px-8 lg:px-10 pt-8 md:pt-10 lg:pt-12 pb-28 md:pb-0 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        {/* Hero Section */}
        <div className="text-center lg:text-left mb-10 lg:mb-0 lg:sticky lg:top-10 self-start">
          <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[32px] md:text-[42px] text-black mb-4 leading-[1.2]">
            나만의<br />페르소나 만들기
          </h1>
          <p className="font-['Noto_Sans_KR'] text-[15px] md:text-[16px] text-[#6b6b6b] leading-[1.7]">
            몇 가지 질문과 입력을 통해<br />
            당신만의 디지털 페르소나를 만들어드려요
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 md:space-y-4 mb-16 md:mb-0">
          <div className="bg-[#f8f8f8] rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <span className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-white">1</span>
            </div>
            <div>
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-1">이미지 분석</h3>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-[1.5]">
                사진을 통해 시각적 이미지를 분석합니다
              </p>
            </div>
          </div>

          <div className="bg-[#f8f8f8] rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <span className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-white">2</span>
            </div>
            <div>
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-1">음성 분석</h3>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-[1.5]">
                목소리의 톤과 느낌을 분석합니다
              </p>
            </div>
          </div>

          <div className="bg-[#f8f8f8] rounded-[16px] p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <span className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-white">3</span>
            </div>
            <div>
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-1">선호 테스트</h3>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-[1.5]">
                7가지 질문으로 당신의 이미지 취향을 분석합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Start Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent">
        <div className="mx-auto max-w-[860px] p-4 sm:p-6 md:px-0 md:pt-6 md:pb-8">
          <button
            onClick={onStart}
            className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}




