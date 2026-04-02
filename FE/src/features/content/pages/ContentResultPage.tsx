import { useState } from "react";
import { ChevronLeft, Download, Home, RefreshCw, User, X } from "lucide-react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import type { ContentCreateResponse } from "../lib/contentApi";

interface ContentResultPageProps {
  ratio: string;
  generatedContent?: ContentCreateResponse | null;
  onSave?: () => void;
  onRegenerate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onViewPersona?: () => void;
}

const getRatioConfig = (ratio?: string) => {
  switch (ratio) {
    case "1:1":
      return { title: "생성된 프로필용 사진", subtitle: "1:1 비율 · 프로필용", aspect: "aspect-square" };
    case "4:5":
      return { title: "생성된 피드용 사진", subtitle: "4:5 비율 · 피드용", aspect: "aspect-[4/5]" };
    case "9:16":
      return { title: "생성된 스토리용 사진", subtitle: "9:16 비율 · 스토리용", aspect: "aspect-[9/16]" };
    default:
      return { title: "생성된 사진", subtitle: "피드용", aspect: "aspect-[4/5]" };
  }
};

export function ContentResultPage({ ratio, generatedContent, onRegenerate, onBack, onHome, onViewPersona }: ContentResultPageProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const ratioInfo = getRatioConfig(ratio);

  const handleDownload = () => {
    if (!generatedContent?.img) return;
    const link = document.createElement("a");
    link.href = generatedContent.img;
    link.download = `generated-${generatedContent.id}.jpg`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />

      <div className="px-8 mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-[#6b6b6b] hover:text-black transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-['Noto_Sans_KR'] text-[14px] font-medium">뒤로가기</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="mb-6 bg-white rounded-[20px] p-5 shadow-sm border border-[#f0f0f0]">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black mb-1">{ratioInfo.title}</h2>
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">{ratioInfo.subtitle} · 총 {generatedContent ? 1 : 0}개 생성됨</p>
        </div>

        {!generatedContent ? (
          <div className="rounded-[16px] border border-[#f2d6d6] bg-[#fff7f7] p-5">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#b42318]">생성된 결과가 없습니다. 다시 생성을 시도해 주세요.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <button
              onClick={() => setIsViewerOpen(true)}
              className={`w-full ${ratioInfo.aspect} rounded-[22px] overflow-hidden bg-[#f2f2f2] border border-[#ececec] shadow-sm`}
            >
              <img src={generatedContent.img} alt="generated-content" className="w-full h-full object-cover" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="h-[50px] rounded-[14px] bg-white border border-[#e5e5e5] text-black font-['Noto_Sans_KR'] text-[14px] font-semibold inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                이미지 저장
              </button>
              <button
                onClick={onRegenerate}
                className="h-[50px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] text-[14px] font-semibold inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                다시 생성
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewPersona}
              className="h-[52px] bg-white border-2 border-black rounded-[16px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] font-semibold text-black"
            >
              <User className="w-5 h-5" />
              페르소나 보기
            </button>
            <button
              onClick={onHome}
              className="h-[52px] bg-white border-2 border-[#e5e5e5] rounded-[16px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] font-semibold text-black"
            >
              <Home className="w-5 h-5" />
              홈으로
            </button>
          </div>
        </div>
      </div>

      {isViewerOpen && generatedContent ? (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="max-w-[390px] w-full">
            <button
              onClick={() => setIsViewerOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
            <div className={`w-full ${ratioInfo.aspect} bg-[#111] rounded-[24px] overflow-hidden shadow-2xl`}>
              <img src={generatedContent.img} alt="generated-content-full" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
