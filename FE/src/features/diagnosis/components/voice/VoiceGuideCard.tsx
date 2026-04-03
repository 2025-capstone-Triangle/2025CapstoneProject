import { Circle, Mic } from "lucide-react";

interface VoiceGuideCardProps {
  sampleScript: string;
  permissionLabel: string;
  permissionState: "unknown" | "prompt" | "granted" | "denied";
  maxTimeLabel: string;
}

export function VoiceGuideCard({
  sampleScript,
  permissionLabel,
  permissionState,
  maxTimeLabel,
}: VoiceGuideCardProps) {
  const permissionDotClassName =
    permissionState === "granted"
      ? "fill-[#16a34a] text-[#16a34a]"
      : permissionState === "denied"
        ? "fill-[#d92d20] text-[#d92d20]"
        : "fill-[#d0d0d0] text-[#d0d0d0]";

  return (
    <div className="mb-4 rounded-[20px] border border-[#eceff3] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-5 lg:mb-0 lg:min-h-[100%]">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3 py-1.5">
        <Mic className="h-4 w-4 text-[#111827]" />
        <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold text-[#374151]">Voice Recorder</span>
      </div>
      <h2 className="mb-2 font-['NEXON_Football_Gothic'] text-[clamp(21px,3vw,26px)] font-bold text-black">
        문장을 또렷하게 읽어주세요
      </h2>
      <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.7] text-[#505050]">"{sampleScript}"</p>
      <p className="mt-2 font-['Noto_Sans_KR'] text-[12px] leading-[1.6] text-[#6b7280]">
        배경 소음이 적은 공간에서, 일정한 속도로 읽어주면 더 안정적으로 분석됩니다.
      </p>
      <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[#ededed] bg-[#fafafa] px-3 py-2">
        <div className="flex items-center gap-2">
          <Circle className={`h-3 w-3 ${permissionDotClassName}`} />
          <span className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">마이크 상태: {permissionLabel}</span>
        </div>
        <span className="font-['Noto_Sans_KR'] text-[11px] text-[#888]">최대 {maxTimeLabel}</span>
      </div>
    </div>
  );
}
