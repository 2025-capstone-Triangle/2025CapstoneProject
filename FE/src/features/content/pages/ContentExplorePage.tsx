import { useEffect, useMemo, useState } from "react";
import { Bookmark, ChevronLeft, Heart, Loader2, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import {
  getReferenceList,
  toggleReferenceLike,
  type ReferenceStatResponse,
} from "../lib/referenceApi";

interface ContentExplorePageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  onHome?: () => void;
}

type CardHeight = "short" | "medium" | "tall";

function ExploreTopBar({ onBack, onViewSaved }: { onBack?: () => void; onViewSaved?: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="h-[56px] flex items-center justify-between px-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black">요즘 뜨는 콘텐츠</h1>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onViewSaved}
        >
          <Bookmark className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
}

interface ContentCardProps {
  item: ReferenceStatResponse;
  height: CardHeight;
  onOpen?: () => void;
  onToggleLike?: (item: ReferenceStatResponse) => void;
  disabled?: boolean;
}

function ContentCard({ item, height, onOpen, onToggleLike, disabled }: ContentCardProps) {
  const heightClasses: Record<CardHeight, string> = {
    short: "h-[180px]",
    medium: "h-[240px]",
    tall: "h-[300px]",
  };

  return (
    <div className="relative group cursor-pointer" onClick={onOpen}>
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
          <p className="font-['Noto_Sans_KR'] text-[11px] text-white/80 mt-0.5">사용 {item.usedCount}</p>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike?.(item);
          }}
          disabled={disabled}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-60"
        >
          <Heart className={`w-4 h-4 transition-all ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-2 text-[#666] font-['Noto_Sans_KR'] text-[14px]">
        <Loader2 className="w-4 h-4 animate-spin" />
        레퍼런스 불러오는 중
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

export function ContentExplorePage({ onBack, onNavigate }: ContentExplorePageProps) {
  const [items, setItems] = useState<ReferenceStatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingLikeId, setPendingLikeId] = useState<number | null>(null);

  const loadReferences = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getReferenceList();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "레퍼런스를 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, []);

  const handleToggleLike = async (target: ReferenceStatResponse) => {
    if (pendingLikeId !== null) return;

    const nextLiked = !target.isLiked;
    setPendingLikeId(target.id);
    setItems((prev) => prev.map((item) => (item.id === target.id ? { ...item, isLiked: nextLiked } : item)));

    try {
      await toggleReferenceLike({ id: target.id, like: nextLiked });
    } catch {
      setItems((prev) => prev.map((item) => (item.id === target.id ? { ...item, isLiked: target.isLiked } : item)));
    } finally {
      setPendingLikeId(null);
    }
  };

  const leftColumn = useMemo(() => {
    return items.filter((_, index) => index % 2 === 0);
  }, [items]);

  const rightColumn = useMemo(() => {
    return items.filter((_, index) => index % 2 === 1);
  }, [items]);

  const getHeight = (index: number): CardHeight => {
    const sequence: CardHeight[] = ["tall", "medium", "short", "medium"];
    return sequence[index % sequence.length];
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">
      <ExploreTopBar onBack={onBack} onViewSaved={() => onNavigate?.("saved-templates")} />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={loadReferences} />}

      {!loading && !error && (
        <div className="px-3 py-3">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-3">
              {leftColumn.map((item, index) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  height={getHeight(index)}
                  onOpen={() => onNavigate?.("content-aspect-ratio")}
                  onToggleLike={handleToggleLike}
                  disabled={pendingLikeId === item.id}
                />
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {rightColumn.map((item, index) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  height={getHeight(index + 1)}
                  onOpen={() => onNavigate?.("content-aspect-ratio")}
                  onToggleLike={handleToggleLike}
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
