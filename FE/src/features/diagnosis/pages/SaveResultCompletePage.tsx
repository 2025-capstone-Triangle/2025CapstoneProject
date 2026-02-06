import { Check } from 'lucide-react';

interface SaveResultCompletePageProps {
  onGoToPersona?: () => void;
  onCreateContent?: () => void;
  onHome?: () => void;
}

export function SaveResultCompletePage({ onGoToPersona, onCreateContent, onHome }: SaveResultCompletePageProps) {
  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Success Icon */}
        <div className="w-32 h-32 bg-[#EF466F] rounded-full flex items-center justify-center mb-12 shadow-lg">
          <Check className="w-16 h-16 text-white" strokeWidth={3} />
        </div>

        {/* Message */}
        <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[32px] text-black mb-4 text-center leading-tight">
          페르소나 저장 완료!
        </h2>
        <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b] text-center mb-16 leading-[1.7]">
          이제 당신만의 페르소나로<br />
          콘텐츠를 만들어보세요
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={onCreateContent}
            className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] transition-colors"
          >
            콘텐츠 만들기
          </button>
          <button
            onClick={onGoToPersona}
            className="w-full bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-black flex items-center justify-center hover:bg-[#f8f8f8] transition-colors"
          >
            페르소나 보기
          </button>
          <button
            onClick={onHome}
            className="w-full bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-black flex items-center justify-center hover:bg-[#f8f8f8] transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}


