import { useState } from "react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { BackButton } from "../../../shared/layout/BackButton";

interface ContentAspectRatioPageProps {
  onNext?: (ratio: string) => void;
  onBack?: () => void;
  onHome?: () => void;
  skipPersonaSelection?: boolean;
}

const ratios = [
  {
    id: "1:1",
    label: "1:1",
    description: "정사각형",
    detail: "프로필 이미지에 적합",
    aspectClass: "aspect-square",
  },
  {
    id: "4:5",
    label: "4:5",
    description: "세로형",
    detail: "인스타그램 피드 게시물에 적합",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "9:16",
    label: "9:16",
    description: "세로 스토리",
    detail: "인스타그램 스토리에 적합",
    aspectClass: "aspect-[9/16]",
  },
];

export function ContentAspectRatioPage({ onNext, onBack, onHome, skipPersonaSelection }: ContentAspectRatioPageProps) {
  const [selectedRatio, setSelectedRatio] = useState<string>("4:5");

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="page-scroll">
        <div className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-2 sm:px-8 md:px-10 md:pb-8">
          <div className="mb-6 md:mb-7">
            <h2 className="mb-2 font-['NEXON_Football_Gothic'] text-[clamp(24px,4vw,34px)] font-bold leading-tight text-black">
              콘텐츠 비율 선택
            </h2>
            <p className="font-['Noto_Sans_KR'] text-[clamp(13px,1.8vw,15px)] text-[#6b6b6b]">
              생성할 콘텐츠의 비율을 선택해 주세요.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {ratios.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setSelectedRatio(ratio.id)}
                className={`w-full rounded-[20px] p-4 sm:p-5 flex items-center md:flex-col md:items-start gap-4 md:gap-3 transition-all ${
                  selectedRatio === ratio.id ? "bg-black shadow-lg" : "bg-[#f8f8f8] hover:bg-[#f0f0f0]"
                }`}
              >
                <div
                  className={`w-[72px] h-[72px] md:w-full md:h-[170px] flex items-center justify-center bg-white rounded-[12px] flex-shrink-0 ${
                    selectedRatio === ratio.id ? "shadow-md" : ""
                  }`}
                >
                  <div
                    className={`${ratio.aspectClass} bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[6px] max-w-[52px] max-h-[52px] md:max-w-[126px] md:max-h-[126px]`}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="mb-1 flex items-baseline gap-2">
                    <h3
                      className={`font-['NEXON_Football_Gothic'] text-[20px] font-bold md:text-[18px] ${
                        selectedRatio === ratio.id ? "text-white" : "text-black"
                      }`}
                    >
                      {ratio.label}
                    </h3>
                    <span
                      className={`font-['Noto_Sans_KR'] text-[13px] ${
                        selectedRatio === ratio.id ? "text-white/80" : "text-[#6b6b6b]"
                      }`}
                    >
                      {ratio.description}
                    </span>
                  </div>
                  <p
                    className={`font-['Noto_Sans_KR'] text-[12px] ${
                      selectedRatio === ratio.id ? "text-white/70" : "text-[#999999]"
                    }`}
                  >
                    {ratio.detail}
                  </p>
                </div>

                <div
                  className={`h-6 w-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center md:self-end ${
                    selectedRatio === ratio.id ? "border-white bg-white" : "border-[#c0c0c0]"
                  }`}
                >
                  {selectedRatio === ratio.id && <div className="h-3 w-3 rounded-full bg-black" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#f0f0f0] bg-white/95 backdrop-blur md:static md:border-t-0 md:bg-transparent md:backdrop-blur-0">
        <div className="mx-auto w-full max-w-[980px] px-4 py-4 sm:px-8 md:px-10 md:pb-8 md:pt-3">
          <button
            onClick={() => onNext?.(selectedRatio)}
            className="flex h-[52px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a] sm:h-[56px] sm:text-[16px]"
          >
            {skipPersonaSelection ? "바로 생성하기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
