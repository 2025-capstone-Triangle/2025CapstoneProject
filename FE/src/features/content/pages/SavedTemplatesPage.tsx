import { useEffect, useMemo, useState } from "react";
import { Heart, Loader2, RefreshCw } from "lucide-react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import {
  getReferenceList,
  toggleReferenceLike,
  type ReferenceStatResponse,
} from "../lib/referenceApi";

interface SavedTemplatesPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  onHome?: () => void;
}

type CardHeight = "short" | "medium" | "tall";

function EmptyState({ onExplore }: { onExplore?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <Heart className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-2 font-['NEXON_Football_Gothic'] text-[18px] font-bold text-black">저장된 템플릿이 없어요</h3>
      <p className="mb-6 text-center font-['Noto_Sans_KR'] text-[14px] text-gray-500">
        마음에 드는 콘텐츠를 저장하면
        <br />
        여기서 다시 볼 수 있어요
      </p>
      <button
        onClick={onExplore}
        className="rounded-full bg-black px-6 py-3 font-['NEXON_Football_Gothic'] text-[14px] font-bold text-white transition-colors hover:bg-gray-800"
      >
        템플릿 둘러보기
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
        <Loader2 className="h-4 w-4 animate-spin" />
        저장 목록 불러오는 중
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full rounded-[16px] border border-[#ececec] bg-[#fafafa] p-5 text-center">
        <p className="mb-4 font-['Noto_Sans_KR'] text-[13px] text-[#444]">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] bg-black px-4 font-['Noto_Sans_KR'] text-[13px] text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 시도
        </button>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  item: ReferenceStatResponse;
  height: CardHeight;
  onClick?: () => void;
  onUnlike?: (item: ReferenceStatResponse) => void;
  disabled?: boolean;
}

function TemplateCard({ item, height, onClick, onUnlike, disabled }: TemplateCardProps) {
  const heightClasses: Record<CardHeight, string> = {
    short: "h-[180px] md:h-[220px]",
    medium: "h-[240px] md:h-[280px]",
    tall: "h-[300px] md:h-[360px]",
  };

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      <div className={`relative ${heightClasses[height]} overflow-hidden rounded-xl bg-gray-100`}>
        <ImageWithFallback
          src={item.img}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="line-clamp-2 font-['NEXON_Football_Gothic'] text-[14px] font-bold text-white">{item.name}</h3>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onUnlike?.(item);
          }}
          disabled={disabled}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60"
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function SavedTemplatesPage({ onBack, onNavigate, onHome }: SavedTemplatesPageProps) {
  const [allItems, setAllItems] = useState<ReferenceStatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingLikeId, setPendingLikeId] = useState<number | null>(null);

  const loadSavedTemplates = async () => {
    setLoading(true);
    setError("");

    try {
      const list = await getReferenceList();
      setAllItems(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장 목록을 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSavedTemplates();
  }, []);

  const savedTemplates = useMemo(() => allItems.filter((item) => item.isLiked), [allItems]);

  const handleUnlike = async (target: ReferenceStatResponse) => {
    if (pendingLikeId !== null) return;

    setPendingLikeId(target.id);
    setAllItems((prev) => prev.map((item) => (item.id === target.id ? { ...item, isLiked: false } : item)));

    try {
      await toggleReferenceLike({ id: target.id, like: false });
    } catch {
      setAllItems((prev) => prev.map((item) => (item.id === target.id ? { ...item, isLiked: target.isLiked } : item)));
    } finally {
      setPendingLikeId(null);
    }
  };

  const leftColumn = useMemo(() => savedTemplates.filter((_, index) => index % 2 === 0), [savedTemplates]);
  const rightColumn = useMemo(() => savedTemplates.filter((_, index) => index % 2 === 1), [savedTemplates]);

  const getHeight = (index: number): CardHeight => {
    const sequence: CardHeight[] = ["tall", "medium", "short", "medium"];
    return sequence[index % sequence.length];
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-gradient-to-b from-[#fafafa] to-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome ?? (() => onNavigate?.("home"))} showNotification={false} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      <div className="mx-auto mb-3 flex w-full max-w-[1120px] items-end justify-between px-4 sm:px-8 md:px-10">
        <h1 className="font-['NEXON_Football_Gothic'] text-[clamp(18px,2.2vw,22px)] font-bold text-black">저장한 템플릿</h1>
        <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500">{savedTemplates.length}개</p>
      </div>

      <div className="page-scroll">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadSavedTemplates} />}

        {!loading && !error && savedTemplates.length === 0 ? (
          <EmptyState onExplore={() => onNavigate?.("content-explore")} />
        ) : null}

        {!loading && !error && savedTemplates.length > 0 ? (
          <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 sm:px-8 md:px-10">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex flex-col gap-3 md:gap-4">
                {leftColumn.map((item, index) => (
                  <TemplateCard
                    key={item.id}
                    item={item}
                    height={getHeight(index)}
                    onClick={() => onNavigate?.("content-aspect-ratio")}
                    onUnlike={handleUnlike}
                    disabled={pendingLikeId === item.id}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3 md:gap-4">
                {rightColumn.map((item, index) => (
                  <TemplateCard
                    key={item.id}
                    item={item}
                    height={getHeight(index + 1)}
                    onClick={() => onNavigate?.("content-aspect-ratio")}
                    onUnlike={handleUnlike}
                    disabled={pendingLikeId === item.id}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
