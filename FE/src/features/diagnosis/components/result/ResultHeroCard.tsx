import { Download, Heart } from "lucide-react";

interface ResultHeroCardProps {
  imageUrl: string;
  personaName: string;
  liked: boolean;
  onToggleLike: () => void;
  onDownload: () => void;
}

export function ResultHeroCard({
  imageUrl,
  personaName,
  liked,
  onToggleLike,
  onDownload,
}: ResultHeroCardProps) {
  return (
    <>
      <div className="relative mx-auto mb-4 w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[460px]">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-[24px] border-4 border-white bg-gradient-to-br from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d] shadow-2xl">
          {imageUrl ? <img src={imageUrl} alt={personaName} className="h-full w-full object-cover" /> : null}
        </div>

        <button
          onClick={onToggleLike}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform hover:scale-110"
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-[#EF466F] text-[#EF466F]" : "text-black"}`} />
        </button>
      </div>

      <div className="mb-1 flex justify-center">
        <button
          type="button"
          onClick={onDownload}
          disabled={!imageUrl}
          className="inline-flex items-center gap-2 rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-2 font-['Noto_Sans_KR'] text-[13px] text-black shadow-sm transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          이미지 다운로드
        </button>
      </div>
    </>
  );
}
