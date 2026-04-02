import { useEffect, useState } from 'react';

export function AnalyzingPage() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    '성향 데이터 분석 중...',
    '이미지 특징 추출 중...',
    '페르소나 생성 중...',
    '톤&무드 설정 중...'
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95;
        }
        return prev + 1;
      });
    }, 180);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
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
            페르소나 생성 중
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            {steps[step]}
          </p>
        </div>
      </div>
    </div>
  );
}




