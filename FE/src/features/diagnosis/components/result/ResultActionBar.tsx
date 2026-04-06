import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

interface ResultActionBarProps {
  mode: "diagnosis" | "view";
  saveError?: string;
  isSaving?: boolean;
  onRecreate?: () => void;
  onSave?: () => void;
  viewLeftActionLabel: string;
  viewMiddleActionLabel?: string;
  viewRightActionLabel: string;
  onViewLeftAction?: () => void;
  onViewMiddleAction?: () => void;
  onViewRightAction?: () => void;
}

export function ResultActionBar({
  mode,
  saveError,
  isSaving = false,
  onRecreate,
  onSave,
  viewLeftActionLabel,
  viewMiddleActionLabel,
  viewRightActionLabel,
  onViewLeftAction,
  onViewMiddleAction,
  onViewRightAction,
}: ResultActionBarProps) {
  let content: ReactNode;

  if (mode === "diagnosis") {
    content = (
      <>
        {saveError ? <p className="mb-2 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{saveError}</p> : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={onRecreate}
            className="flex h-[52px] items-center justify-center gap-2 rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[14px] font-semibold text-black transition-all hover:border-black hover:bg-[#fafafa] sm:h-[56px] sm:text-[16px]"
          >
            <RotateCcw className="h-5 w-5" />
            다시 만들기
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex h-[52px] items-center justify-center rounded-[16px] bg-gradient-to-r from-black to-[#2d2d2d] font-['Noto_Sans_KR'] text-[14px] font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60 sm:h-[56px] sm:text-[16px]"
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <div
        className={`grid grid-cols-1 gap-3 ${viewMiddleActionLabel ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <button
          onClick={onViewLeftAction}
          className="flex h-[52px] items-center justify-center rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[14px] font-semibold text-black transition-all hover:border-black hover:bg-[#fafafa] sm:h-[56px] sm:text-[16px]"
        >
          {viewLeftActionLabel}
        </button>
        {viewMiddleActionLabel ? (
          <button
            onClick={onViewMiddleAction}
            className="flex h-[52px] items-center justify-center rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[14px] font-semibold text-black transition-all hover:border-black hover:bg-[#fafafa] sm:h-[56px] sm:text-[16px]"
          >
            {viewMiddleActionLabel}
          </button>
        ) : null}
        <button
          onClick={onViewRightAction}
          className="flex h-[52px] items-center justify-center rounded-[16px] bg-gradient-to-r from-black to-[#2d2d2d] font-['Noto_Sans_KR'] text-[14px] font-semibold text-white shadow-lg transition-all hover:shadow-xl sm:h-[56px] sm:text-[16px]"
        >
          {viewRightActionLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-[#f0f0f0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-10">{content}</div>
    </div>
  );
}
