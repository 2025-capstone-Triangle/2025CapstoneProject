import { useEffect, useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';

interface ContentGeneratingPageProps {
  onComplete?: () => void;
}

export function ContentGeneratingPage({ onComplete }: ContentGeneratingPageProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    '페르소나 분석 중...',
    '콘텐츠 구성 중...',
    '비주얼 생성 중...',
    '최종 조정 중...'
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600); // 2000 → 600ms (빠르게)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 4; // 1 → 4 (4배 빠르게)
        }
        clearInterval(progressInterval);
        setTimeout(() => onComplete?.(), 300); // 500 → 300ms
        return 100;
      });
    }, 25); // 100 → 25ms (4배 빠르게)

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Loading Animation */}
        <div className="relative mb-16">
          <div className="w-32 h-32 border-4 border-[#f0f0f0] rounded-full" />
          <div 
            className="absolute inset-0 w-32 h-32 border-4 border-black rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>

        {/* Progress */}
        <div className="w-full max-w-[280px] mb-12">
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] text-center font-semibold">
            {progress}%
          </p>
        </div>

        {/* Current Step */}
        <div className="text-center">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-4">
            콘텐츠 생성 중
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            {steps[step]}
          </p>
        </div>
      </div>
    </div>
  );
}


