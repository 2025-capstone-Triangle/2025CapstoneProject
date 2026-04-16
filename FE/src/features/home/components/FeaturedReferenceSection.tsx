import { ArrowRight, Heart } from "lucide-react";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import { type ReferenceStatResponse } from "../../content/lib/referenceApi";

export function SectionHeader({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <div className="flex items-end justify-between gap-3 px-1.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="home-trend-title text-[clamp(16px,1.4vw,19px)] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#111827]">
          요즘 뜨는 콘텐츠
        </h2>
        <p className="home-trend-subtitle text-[11px] font-normal leading-[1.35] text-[#667085] md:text-[12px]">
          지금 인기 있는 스타일 레퍼런스를 확인해 보세요.
        </p>
      </div>
      <button
        className="home-trend-subtitle inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#dbe2ea] bg-white/85 px-3 text-[11px] font-medium text-[#475467] transition-colors hover:border-[#c5ced9] hover:text-[#111827] md:h-9 md:text-[12px]"
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
        <div className="relative h-[clamp(150px,23vh,250px)] overflow-hidden rounded-[18px] border border-white/45 shadow-[0_8px_18px_rgba(15,23,42,0.1)] transition-all duration-500 group-hover:shadow-[0_12px_24px_rgba(15,23,42,0.14)] md:h-[clamp(126px,18vh,196px)] md:rounded-[18px]">
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
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/92 opacity-100 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed md:h-8 md:w-8 md:opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-all md:h-4 md:w-4 ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>
        </div>
        <div className="mt-2 px-0.5">
          <p className="font-body line-clamp-1 text-[12px] font-semibold tracking-[-0.005em] text-[#101828] md:text-[13px]">
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
