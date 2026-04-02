import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface ContentGeneratingPageProps {
  errorMessage?: string;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ContentGeneratingPage({ errorMessage, onRetry, onBack, onHome }: ContentGeneratingPageProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "페르소나 분석 중...",
    "콘텐츠 구성 중...",
    "비주얼 생성 중...",
    "최종 조정 중...",
  ];

  useEffect(() => {
    if (errorMessage) return;

    const stepInterval = setInterval(() => {
      setStep((prev) => {
        return (prev + 1) % steps.length;
      });
    }, 900);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + 2;
      });
    }, 120);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [errorMessage, steps.length]);

  useEffect(() => {
    if (!errorMessage) return;
    setProgress(0);
    setStep(0);
  }, [errorMessage]);

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-14">
        <div className="relative mb-12">
          <div className="w-32 h-32 border-4 border-[#f0f0f0] rounded-full" />
          <div
            className="absolute inset-0 w-32 h-32 border-4 border-black rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: "1s" }}
          />
        </div>

        <div className="w-full max-w-[280px] mb-8">
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

        <div className="text-center">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-4">
            콘텐츠 생성 중
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            {errorMessage ? "생성 요청 중 문제가 발생했습니다." : steps[step]}
          </p>
        </div>

        {errorMessage ? (
          <div className="w-full max-w-[320px] mt-8 rounded-[16px] border border-[#f2d6d6] bg-[#fff7f7] p-4">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#d92d20] mt-0.5" />
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#b42318] leading-[1.6]">{errorMessage}</p>
            </div>
            <button
              onClick={onRetry}
              className="w-full h-[42px] rounded-[12px] bg-black text-white font-['Noto_Sans_KR'] text-[13px] font-semibold inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

