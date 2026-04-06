import { useState } from "react";
import { Download, Home, RefreshCw, User, X, List } from "lucide-react";
import type { ContentCreateResponse } from "../lib/contentApi";
import { ContentPageLayout } from "../components/ContentPageLayout";

interface ContentResultPageProps {
  ratio: string;
  generatedContent?: ContentCreateResponse | null;
  onSave?: () => void;
  onRegenerate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onViewPersona?: () => void;
  onViewContentList?: () => void;
}

const getRatioConfig = (ratio?: string) => {
  switch (ratio) {
    case "1:1":
      return { title: "생성된 프로필 이미지", subtitle: "1:1 비율 · 프로필용", aspect: "aspect-square" };
    case "4:5":
      return { title: "생성된 피드 이미지", subtitle: "4:5 비율 · 피드 게시물용", aspect: "aspect-[4/5]" };
    case "9:16":
      return { title: "생성된 스토리 이미지", subtitle: "9:16 비율 · 스토리용", aspect: "aspect-[9/16]" };
    default:
      return { title: "생성된 이미지", subtitle: "4:5 비율", aspect: "aspect-[4/5]" };
  }
};

export function ContentResultPage({
  ratio,
  generatedContent,
  onRegenerate,
  onBack,
  onHome,
  onViewPersona,
  onViewContentList,
}: ContentResultPageProps) {
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
    <ContentPageLayout
      onBack={onBack}
      onHome={onHome}
      rootClassName="bg-gradient-to-b from-[#fafafa] to-white"
      contentMaxWidthClassName="max-w-[1120px]"
      contentClassName="px-4 pb-10 pt-2 sm:px-8 md:px-10"
      scrollContent
    >
      <div className="mb-5 rounded-[20px] border border-[#f0f0f0] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-1 font-['NEXON_Football_Gothic'] text-[clamp(16px,2vw,22px)] font-bold text-black">
          {ratioInfo.title}
        </h2>
        <p className="font-['Noto_Sans_KR'] text-[clamp(12px,1.4vw,13px)] text-[#6b6b6b]">
          {ratioInfo.subtitle} · 총 {generatedContent ? 1 : 0}개 생성
        </p>
      </div>

      {!generatedContent ? (
        <div className="rounded-[16px] border border-[#f2d6d6] bg-[#fff7f7] p-5">
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#b42318]">생성된 결과가 없습니다. 다시 생성해 주세요.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <button
            onClick={() => setIsViewerOpen(true)}
            className={`w-full ${ratioInfo.aspect} overflow-hidden rounded-[22px] border border-[#ececec] bg-[#f2f2f2] shadow-sm`}
          >
            <img src={generatedContent.img} alt="generated-content" className="h-full w-full object-cover" />
          </button>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              <button
                onClick={handleDownload}
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[14px] border border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] font-semibold text-black transition-colors hover:border-black"
              >
                <Download className="h-4 w-4" />
                이미지 저장
              </button>
              <button
                onClick={onRegenerate}
                className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                <RefreshCw className="h-4 w-4" />
                다시 생성
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:mt-auto">
              <button
                onClick={onViewPersona}
                className="flex h-[50px] items-center justify-center gap-2 rounded-[16px] border-2 border-black bg-white font-['Noto_Sans_KR'] text-[13px] font-semibold text-black transition-colors hover:bg-[#fafafa]"
              >
                <User className="h-4 w-4" />
                페르소나 보기
              </button>
              <button
                onClick={onViewContentList}
                className="flex h-[50px] items-center justify-center gap-2 rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] font-semibold text-black transition-colors hover:border-black hover:bg-[#fafafa]"
              >
                <List className="h-4 w-4" />
                콘텐츠 리스트 보기
              </button>
              <button
                onClick={onHome}
                className="flex h-[50px] items-center justify-center gap-2 rounded-[16px] border-2 border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] font-semibold text-black transition-colors hover:border-black hover:bg-[#fafafa]"
              >
                <Home className="h-4 w-4" />
                홈으로
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewerOpen && generatedContent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6">
          <div className="w-full max-w-[520px]">
            <button
              onClick={() => setIsViewerOpen(false)}
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
            >
              <X className="h-6 w-6 text-white" strokeWidth={2.5} />
            </button>
            <div className={`w-full ${ratioInfo.aspect} overflow-hidden rounded-[24px] bg-[#111] shadow-2xl`}>
              <img src={generatedContent.img} alt="generated-content-full" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      ) : null}
    </ContentPageLayout>
  );
}
