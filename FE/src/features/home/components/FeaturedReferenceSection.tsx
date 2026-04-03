import { ChevronRight, Heart } from "lucide-react";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import { type ReferenceStatResponse } from "../../content/lib/referenceApi";

export function SectionHeader({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <div className="mb-1.5 flex items-center justify-between px-1 md:mb-2">
      <h2 className="font-['NEXON_Football_Gothic'] text-[clamp(17px,1.7vw,24px)] font-bold text-black">
        요즘 뜨는 콘텐츠
      </h2>
      <button
        className="flex items-center gap-1 font-['Noto_Sans_KR'] text-[clamp(12px,1.1vw,13px)] text-[#888] transition-colors hover:text-black"
        onClick={onViewAll}
      >
        전체보기
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function FeaturedReferenceCard({
  item,
  onToggleLike,
  pendingLikeId,
}: {
  item: ReferenceStatResponse;
  onToggleLike: (item: ReferenceStatResponse) => void;
  pendingLikeId: number | null;
}) {
  return (
    <div className="w-full">
      <div className="group relative cursor-pointer">
        <div className="relative h-[clamp(90px,15vh,168px)] overflow-hidden rounded-[14px] shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_14px_24px_rgba(0,0,0,0.18)] md:rounded-[16px]">
          <ImageWithFallback
            alt={item.name}
            src={item.img}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike(item);
            }}
            disabled={pendingLikeId !== null && pendingLikeId !== item.id}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 opacity-100 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed md:right-3 md:top-3 md:h-8 md:w-8 md:opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-all md:h-4 md:w-4 ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>
        </div>
        <div className="mt-1.5 md:mt-2">
          <p className="line-clamp-1 font-['Noto_Sans_KR'] text-[10px] font-semibold text-black sm:text-[11px] md:text-[13px]">
            {item.name}
          </p>
          <p className="mt-1 hidden line-clamp-2 font-['Noto_Sans_KR'] text-[11px] text-[#888] md:block">
            {item.description ?? "추천 레퍼런스"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FeaturedSectionProps {
  items: ReferenceStatResponse[];
  loading: boolean;
  error: string;
  pendingLikeId: number | null;
  onToggleLike: (item: ReferenceStatResponse) => void;
}

export function FeaturedReferenceSection({
  items,
  loading,
  error,
  pendingLikeId,
  onToggleLike,
}: FeaturedSectionProps) {
  if (loading) {
    return (
      <div className="flex min-h-[120px] items-center justify-center px-6">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">추천 콘텐츠를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-6 mt-4 rounded-[16px] border border-[#efefef] bg-white px-6 py-4">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#d92d20]">{error}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-6 mt-4 rounded-[16px] border border-[#efefef] bg-white px-6 py-4">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">표시할 콘텐츠가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 px-1 md:gap-3">
      {items.map((item) => (
        <FeaturedReferenceCard
          key={item.id}
          item={item}
          pendingLikeId={pendingLikeId}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}
