import { ChevronDown, Edit2 } from "lucide-react";

interface ResultInfoSectionsProps {
  mode: "diagnosis" | "view";
  personaName: string;
  keywords: string[];
  colors: string[];
  description: string;
  traitsDetail: string;
  showDetails: boolean;
  onToggleDetails: () => void;
  onEditName?: () => void;
  onCopyColor: (hexColor: string) => void;
}

export function ResultInfoSections({
  mode,
  personaName,
  keywords,
  colors,
  description,
  traitsDetail,
  showDetails,
  onToggleDetails,
  onEditName,
  onCopyColor,
}: ResultInfoSectionsProps) {
  return (
    <div className="mx-auto w-full rounded-[24px] border border-[#eceff3] bg-white px-5 pb-8 pt-7 shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:px-8 lg:px-9">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-['NEXON_Football_Gothic'] text-[22px] text-black">{personaName}</h2>
          {mode === "view" && onEditName ? (
            <button
              type="button"
              onClick={onEditName}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ececec] bg-white text-[#444] transition-colors hover:border-black hover:text-black"
              aria-label="페르소나 이름 수정"
              title="이름 수정"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {keywords.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[#e5e5e5] bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] px-4 py-2 font-['NEXON_Football_Gothic'] text-[16px] text-black"
              >
                #{keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-4 font-['Noto_Sans_KR'] text-[13px] text-[#666]">키워드 데이터가 없습니다.</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 font-['Noto_Sans_KR'] text-[15px] font-semibold text-black">
          <div className="h-5 w-1 rounded-full bg-black" />
          컬러 팔레트
        </h3>
        {colors.length > 0 ? (
          <div className="rounded-[16px] border border-[#ececec] bg-gradient-to-r from-[#fcfcfc] to-[#f7f7f7] p-3">
            <div className="flex items-center gap-3 overflow-x-auto">
              {colors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  title={`${color.toUpperCase()} 복사`}
                  onClick={() => onCopyColor(color)}
                  className="group relative h-11 w-11 shrink-0 rounded-full border border-transparent shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-colors hover:border-black/40 focus-visible:border-black focus-visible:outline-none md:h-12 md:w-12"
                  style={{ backgroundColor: color }}
                >
                  <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[10px] border border-white/15 bg-black/90 px-2.5 py-1.5 font-['Noto_Sans_KR'] text-[11px] text-white opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {color.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#ececec] bg-[#fafafa] p-5">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">컬러 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 font-['Noto_Sans_KR'] text-[15px] font-semibold text-black">
          <div className="h-5 w-1 rounded-full bg-black" />
          페르소나 요약
        </h3>
        <div className="rounded-[16px] border border-[#e5e5e5] bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] p-5">
          <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.8] text-[#262626]">{description}</p>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={onToggleDetails}
          className="flex w-full items-center justify-between rounded-[16px] border-2 border-[#f0f0f0] px-5 py-4 transition-colors hover:border-[#e5e5e5]"
        >
          <span className="font-['Noto_Sans_KR'] text-[14px] font-semibold text-black">상세 정보 보기</span>
          <ChevronDown className={`h-5 w-5 text-[#6b6b6b] transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>
        {showDetails ? (
          <div className="mt-3 rounded-[16px] border border-[#e5e5e5] bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] p-5">
            <p className="font-['Noto_Sans_KR'] text-[14px] leading-[1.8] text-[#262626]">
              {traitsDetail || "추가 특성 정보가 없습니다."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
