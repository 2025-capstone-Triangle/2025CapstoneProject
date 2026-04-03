import { useEffect, useMemo, useState } from "react";
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

  const steps = useMemo(
    () => ["페르소나 분석 중...", "콘텐츠 구성 중...", "이미지 생성 중...", "최종 보정 중..."],
    [],
  );

  useEffect(() => {
    if (errorMessage) return;

    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
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
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-14 md:px-10">
        <div className="relative mb-12">
          <div className="h-28 w-28 rounded-full border-4 border-[#f0f0f0] md:h-32 md:w-32" />
          <div
            className="absolute inset-0 h-28 w-28 animate-spin rounded-full border-4 border-black border-t-transparent md:h-32 md:w-32"
            style={{ animationDuration: "1s" }}
          />
        </div>

        <div className="mb-8 w-full max-w-[320px]">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center font-['Noto_Sans_KR'] text-[14px] font-semibold text-[#6b6b6b]">{progress}%</p>
        </div>

        <div className="text-center">
          <h2 className="mb-4 font-['NEXON_Football_Gothic'] text-[clamp(26px,4vw,34px)] font-bold text-black">콘텐츠 생성 중</h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            {errorMessage ? "생성 요청 중 문제가 발생했습니다." : steps[step]}
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-8 w-full max-w-[380px] rounded-[16px] border border-[#f2d6d6] bg-[#fff7f7] p-4">
            <div className="mb-3 flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[#d92d20]" />
              <p className="font-['Noto_Sans_KR'] text-[12px] leading-[1.6] text-[#b42318]">{errorMessage}</p>
            </div>
            <button
              onClick={onRetry}
              className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-black font-['Noto_Sans_KR'] text-[13px] font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
