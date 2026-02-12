import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Heart, Loader2, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import {
  getReferenceList,
  toggleReferenceLike,
  type ReferenceStatResponse,
} from "../lib/referenceApi";

interface SavedTemplatesPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

type CardHeight = "short" | "medium" | "tall";

function SavedTopBar({ onBack, count }: { onBack?: () => void; count: number }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="h-[56px] flex items-center justify-between px-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black">저장한 템플릿</h1>
          <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-500">{count}개</p>
        </div>
        <div className="w-9" />
      </div>
    </div>
  );
}

function EmptyState({ onExplore }: { onExplore?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Heart className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black mb-2">
        저장된 템플릿이 없어요
      </h3>
      <p className="font-['Noto_Sans_KR'] text-[14px] text-gray-500 text-center mb-6">
        마음에 드는 콘텐츠를 저장하면
        <br />
        여기서 다시 볼 수 있어요
      </p>
      <button
        onClick={onExplore}
        className="px-6 py-3 bg-black text-white rounded-full font-['NEXON_Football_Gothic'] font-bold text-[14px] hover:bg-gray-800 transition-colors"
      >
        템플릿 둘러보기
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-[#666] font-['Noto_Sans_KR'] text-[14px]">
        <Loader2 className="w-4 h-4 animate-spin" />
        저장 목록 불러오는 중
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full rounded-[16px] border border-[#ececec] p-5 bg-[#fafafa] text-center">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#444] mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="h-[38px] px-4 rounded-[10px] bg-black text-white text-[13px] font-['Noto_Sans_KR'] inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
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
    short: "h-[180px]",
    medium: "h-[240px]",
    tall: "h-[300px]",
  };

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className={`relative ${heightClasses[height]} rounded-xl overflow-hidden bg-gray-100`}>
        <ImageWithFallback
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-['NEXON_Football_Gothic'] text-[14px] text-white font-bold line-clamp-2">
            {item.name}
          </h3>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onUnlike?.(item);
          }}
          disabled={disabled}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-60"
        >
          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function SavedTemplatesPage({ onBack, onNavigate }: SavedTemplatesPageProps) {
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
    loadSavedTemplates();
  }, []);

  const savedTemplates = useMemo(() => {
    return allItems.filter((item) => item.isLiked);
  }, [allItems]);

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

  const leftColumn = useMemo(() => {
    return savedTemplates.filter((_, index) => index % 2 === 0);
  }, [savedTemplates]);

  const rightColumn = useMemo(() => {
    return savedTemplates.filter((_, index) => index % 2 === 1);
  }, [savedTemplates]);

  const getHeight = (index: number): CardHeight => {
    const sequence: CardHeight[] = ["tall", "medium", "short", "medium"];
    return sequence[index % sequence.length];
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">
      <SavedTopBar onBack={onBack} count={savedTemplates.length} />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={loadSavedTemplates} />}

      {!loading && !error && savedTemplates.length === 0 && (
        <EmptyState onExplore={() => onNavigate?.("content-explore")} />
      )}

      {!loading && !error && savedTemplates.length > 0 && (
        <div className="px-3 py-3">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-3">
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
            <div className="flex-1 flex flex-col gap-3">
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
      )}
    </div>
  );
}
