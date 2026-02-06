import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';

interface ReviewInputsPageProps {
  onConfirm?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ReviewInputsPage({ onConfirm, onBack, onHome }: ReviewInputsPageProps) {
  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="px-8 pt-8">
        <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-8">
          입력 내용 확인
        </h2>

        {/* Summary Cards */}
        <div className="space-y-3 mb-8">
          {/* Trait Test Result */}
          <div className="bg-[#f8f8f8] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black">성향 테스트</h3>
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#EF466F] font-medium">완료</span>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              5개 질문 응답 완료
            </p>
          </div>

          {/* Image Input */}
          <div className="bg-[#f8f8f8] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black">이미지 분석</h3>
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#EF466F] font-medium">완료</span>
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-16 bg-[#e0e0e0] rounded-[10px]" />
              <div className="w-16 h-16 bg-[#e0e0e0] rounded-[10px]" />
            </div>
          </div>

          {/* Voice Input */}
          <div className="bg-[#f8f8f8] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black">음성 분석</h3>
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">선택 안 함</span>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              음성 데이터가 없습니다
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f7ff] rounded-[16px] p-5 mb-8">
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#1a4d8f] leading-[1.7]">
            입력하신 데이터를 기반으로 AI가 당신만의 페르소나를 분석합니다. 
            분석에는 약 1-2분이 소요됩니다.
          </p>
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <button
          onClick={onConfirm}
          className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] transition-colors"
        >
          분석 시작하기
        </button>
      </div>
    </div>
  );
}

