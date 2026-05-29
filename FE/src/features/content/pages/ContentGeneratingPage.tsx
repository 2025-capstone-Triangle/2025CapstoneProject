import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ContentPageLayout } from "../components/ContentPageLayout";

interface ContentGeneratingPageProps {
  errorMessage?: string;
  progress?: number;
  statusMessage?: string;
  status?: "idle" | "connecting" | "queued" | "processing" | "running" | "completed" | "error";
  queuePosition?: number | null;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function ContentGeneratingPage({
  errorMessage,
  progress,
  statusMessage,
  status = "running",
  queuePosition = null,
  onRetry,
  onBack,
  onHome,
}: ContentGeneratingPageProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => ["페르소나 분석 중...", "콘텐츠 구성 중...", "이미지 생성 중...", "최종 보정 중..."],
    [],
  );

  const isQueued = status === "queued";

  useEffect(() => {
    if (errorMessage || typeof progress === "number") return;

    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + 1;
      });
    }, 420);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [errorMessage, progress, steps.length]);

  useEffect(() => {
    if (!errorMessage) return;
    setSimulatedProgress(0);
    setStep(0);
  }, [errorMessage]);

  const displayProgress = typeof progress === "number" ? clampProgress(progress) : simulatedProgress;
  const displayMessage = errorMessage ? "생성 요청 중 문제가 발생했습니다." : (statusMessage || steps[step]);

  return (
    <ContentPageLayout
      onBack={onBack}
      onHome={onHome}
      scrollContent={false}
      contentMaxWidthClassName="max-w-[980px]"
      contentClassName="px-6 pb-14 pt-8 md:px-10"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative mb-12">
          <div className="h-28 w-28 rounded-full border-4 border-[#f0f0f0] md:h-32 md:w-32" />
          <div
            className="absolute inset-0 h-28 w-28 animate-spin rounded-full border-4 border-black border-t-transparent md:h-32 md:w-32"
            style={{ animationDuration: "1s" }}
          />
        </div>

        {isQueued ? (
          <div className="mb-7 space-y-3 text-center md:mb-8">
            <div className="rounded-[20px] border border-[#e7e7e7] bg-[#fafafa] px-6 py-5">
              <p className="mb-1 font-['Noto_Sans_KR'] text-[13px] font-medium text-[#6d6d6d]">현재 대기 순번</p>
              <p className="font-['NEXON_Football_Gothic'] text-[34px] leading-none text-black">
                {queuePosition ?? "-"}번
              </p>
            </div>
            <p className="max-w-[520px] px-1 text-[12px] leading-[1.6] text-[#6b6b6b] md:text-[13px]">
              서버 용량을 늘리려면 추가 비용이 발생해서, 현재 데모 환경에서는 동시에 최대 2명만 콘텐츠를
              생성할 수 있어 대기열이 있습니다. 양해 부탁드려요 :)
            </p>
          </div>
        ) : (
          <div className="mb-8 w-full max-w-[320px]">
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div className="h-full bg-black transition-all duration-300" style={{ width: `${displayProgress}%` }} />
            </div>
            <p className="text-center font-['Noto_Sans_KR'] text-[14px] font-semibold text-[#6b6b6b]">{displayProgress}%</p>
          </div>
        )}

        {!isQueued && (
          <div className="text-center">
            <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">{displayMessage}</p>
          </div>
        )}

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
    </ContentPageLayout>
  );
}
