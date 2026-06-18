import { Sparkles } from "lucide-react";

interface ResultStatusBadgeProps {
  mode: "diagnosis" | "view";
  customLabel?: string;
}

export function ResultStatusBadge({ mode, customLabel }: ResultStatusBadgeProps) {
  return (
    <div className="mb-4 flex justify-center lg:justify-start">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] px-5 py-2 text-white shadow-lg">
        <Sparkles className="h-4 w-4" />
        <span className="font-brand text-[13px] font-semibold tracking-[0.01em]">
          {customLabel ?? (mode === "view" ? "저장된 페르소나" : "페르소나 생성 완료")}
        </span>
      </div>
    </div>
  );
}
