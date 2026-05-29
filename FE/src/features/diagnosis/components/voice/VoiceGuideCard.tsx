import { Circle } from "lucide-react";

interface VoiceGuideCardProps {
  permissionLabel: string;
  permissionState: "unknown" | "prompt" | "granted" | "denied";
  maxTimeLabel: string;
}

export function VoiceGuideCard({ permissionLabel, permissionState, maxTimeLabel }: VoiceGuideCardProps) {
  const permissionDotClassName =
    permissionState === "granted"
      ? "fill-[#16a34a] text-[#16a34a]"
      : permissionState === "denied"
        ? "fill-[#d92d20] text-[#d92d20]"
        : "fill-[#d0d0d0] text-[#d0d0d0]";

  return (
    <div className="mb-3 rounded-[14px] border border-[#eceff3] bg-white px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Circle className={`h-3 w-3 ${permissionDotClassName}`} />
          <span className="font-['Noto_Sans_KR'] text-[13px] font-medium text-[#374151]">마이크 상태: {permissionLabel}</span>
        </div>

        <span className="rounded-full bg-[#f6f7f9] px-2.5 py-1 font-['Noto_Sans_KR'] text-[12px] text-[#4b5563]">
          최대 {maxTimeLabel}
        </span>
      </div>
    </div>
  );
}
