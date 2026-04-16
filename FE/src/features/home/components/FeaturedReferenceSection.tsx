import { ArrowRight, Heart } from "lucide-react";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import { type ReferenceStatResponse } from "../../content/lib/referenceApi";

export function SectionHeader({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <div className="flex items-end justify-between px-1">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-brand text-[clamp(22px,2.1vw,30px)] font-bold leading-[1.1] text-black">
          요즘 뜨는 콘텐츠
        </h2>
        <p className="font-body text-[12px] font-medium text-[#6b7280] md:text-[13px]">
          지금 인기 있는 스타일 레퍼런스를 확인해 보세요.
        </p>
      </div>
      <button
        className="font-body inline-flex h-9 items-center gap-1 rounded-full border border-[#d7e0ea] bg-white/80 px-3 text-[12px] font-semibold text-[#4b5563] transition-colors hover:bg-white hover:text-black"
        onClick={onViewAll}
      >
        전체보기
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.1} />
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
    <div className="w-full md:min-w-0">
      <div className="group relative cursor-pointer md:min-w-0">
        <div className="relative h-[clamp(154px,24vh,264px)] overflow-hidden rounded-[18px] border border-white/40 shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover:shadow-[0_16px_28px_rgba(15,23,42,0.16)] md:h-[clamp(132px,18vh,210px)] md:rounded-[18px]">
          <ImageWithFallback
            alt={item.name}
            src={item.img}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike(item);
            }}
            disabled={pendingLikeId !== null && pendingLikeId !== item.id}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/92 opacity-100 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed md:h-8 md:w-8 md:opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-all md:h-4 md:w-4 ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>
        </div>
        <div className="mt-2 px-0.5">
          <p className="font-body line-clamp-1 text-[12px] font-semibold text-[#111827] md:text-[13px]">
            {item.name}
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
      <div className="flex min-h-[140px] items-center justify-center rounded-[18px] border border-[#eceff3] bg-white px-6">
        <p className="font-body text-[13px] text-[#666]">추천 콘텐츠를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-[#efefef] bg-white px-6 py-4">
        <p className="font-body text-[13px] text-[#d92d20]">{error}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[18px] border border-[#efefef] bg-white px-6 py-4">
        <p className="font-body text-[13px] text-[#666]">표시할 콘텐츠가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-3 md:overflow-visible">
      {items.map((item) => (
        <div key={item.id} className="min-w-[178px] snap-start sm:min-w-[210px] md:min-w-0">
          <FeaturedReferenceCard
            item={item}
            pendingLikeId={pendingLikeId}
            onToggleLike={onToggleLike}
          />
        </div>
      ))}
    </div>
  );
}
