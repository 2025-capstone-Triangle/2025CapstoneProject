import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';

interface ContentAspectRatioPageProps {
  onNext?: (ratio: string) => void;
  onBack?: () => void;
  onHome?: () => void;
  skipPersonaSelection?: boolean; // 페르소나 선택을 건너뛰고 바로 생성
}

const ratios = [
  { 
    id: '1:1', 
    label: '1:1', 
    description: '정사각형',
    detail: '인스타그램 피드',
    aspectClass: 'aspect-square'
  },
  { 
    id: '4:5', 
    label: '4:5', 
    description: '세로형',
    detail: '인스타그램 피드',
    aspectClass: 'aspect-[4/5]'
  },
  { 
    id: '9:16', 
    label: '9:16', 
    description: '세로 풀스크린',
    detail: '스토리/릴스',
    aspectClass: 'aspect-[9/16]'
  }
];

export function ContentAspectRatioPage({ onNext, onBack, onHome, skipPersonaSelection }: ContentAspectRatioPageProps) {
  const [selectedRatio, setSelectedRatio] = useState<string>('4:5');

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32">
        {/* Header */}
        <div className="mb-10">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-3 leading-tight">
            컨텐츠 비율 선택
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            생성할 컨텐츠의 비율을 선택해주세요
          </p>
        </div>

        {/* Ratio Cards */}
        <div className="space-y-3 mb-8">
          {ratios.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => setSelectedRatio(ratio.id)}
              className={`w-full rounded-[20px] p-5 flex items-center gap-5 transition-all ${
                selectedRatio === ratio.id
                  ? 'bg-black shadow-lg'
                  : 'bg-[#f8f8f8] hover:bg-[#f0f0f0]'
              }`}
            >
              {/* Preview Box */}
              <div className={`w-[80px] h-[80px] flex items-center justify-center bg-white rounded-[12px] flex-shrink-0 ${
                selectedRatio === ratio.id ? 'shadow-md' : ''
              }`}>
                <div 
                  className={`${ratio.aspectClass} bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[6px] max-w-[60px] max-h-[60px]`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className={`font-['NEXON_Football_Gothic'] font-bold text-[22px] ${
                    selectedRatio === ratio.id ? 'text-white' : 'text-black'
                  }`}>
                    {ratio.label}
                  </h3>
                  <span className={`font-['Noto_Sans_KR'] text-[14px] ${
                    selectedRatio === ratio.id ? 'text-white/80' : 'text-[#6b6b6b]'
                  }`}>
                    {ratio.description}
                  </span>
                </div>
                <p className={`font-['Noto_Sans_KR'] text-[13px] ${
                  selectedRatio === ratio.id ? 'text-white/70' : 'text-[#999999]'
                }`}>
                  {ratio.detail}
                </p>
              </div>

              {/* Radio */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedRatio === ratio.id
                  ? 'border-white bg-white'
                  : 'border-[#c0c0c0]'
              }`}>
                {selectedRatio === ratio.id && (
                  <div className="w-3 h-3 bg-black rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <button
          onClick={() => onNext?.(selectedRatio)}
          className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}


