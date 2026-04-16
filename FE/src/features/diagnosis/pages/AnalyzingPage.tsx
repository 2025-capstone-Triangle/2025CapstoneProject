import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";

interface AnalyzingPageProps {
  progress?: number;
  message?: string;
  onBack?: () => void;
  onHome?: () => void;
}

function clampProgress(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function AnalyzingPage({
  progress,
  message = "AI가 페르소나를 분석하고 있습니다...",
  onBack,
  onHome,
}: AnalyzingPageProps) {
  const safeProgress = clampProgress(progress);

  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[980px]"
      contentClassName="px-5 pb-8 pt-2 sm:px-8 md:px-10"
    >
      <div className="mx-auto flex min-h-0 flex-1 w-full flex-col items-center justify-center py-6 md:py-4">
        <div className="relative mb-10 md:mb-12">
          <div className="h-28 w-28 rounded-full border-4 border-[#f0f0f0] md:h-32 md:w-32" />
          <div
            className="absolute inset-0 h-28 w-28 animate-spin rounded-full border-4 border-black border-t-transparent md:h-32 md:w-32"
            style={{ animationDuration: "1s" }}
          />
        </div>

        <div className="mb-7 w-full max-w-[420px] md:mb-8">
          <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${safeProgress}%` }} />
          </div>
          <p className="text-center font-['Noto_Sans_KR'] text-[14px] font-semibold text-[#6b6b6b]">{safeProgress}%</p>
        </div>

        <p className="max-w-[520px] text-center font-['Noto_Sans_KR'] text-[15px] leading-[1.7] text-[#4d4d4d] md:text-[16px]">
          {message}
        </p>
      </div>
    </DiagnosisPageLayout>
  );
}
