import { useEffect, useMemo, useState } from "react";
import { Bookmark, Heart, Loader2, RefreshCw } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
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
  onSelectReference?: (id: number) => void;
}

type CardHeight = "short" | "medium" | "tall";

interface ContentCardProps {
  item: ReferenceStatResponse;
  height: CardHeight;
  onOpen?: () => void;
  onToggleLike?: (item: ReferenceStatResponse) => void;
  disabled?: boolean;
}

function ContentCard({ item, height, onOpen, onToggleLike, disabled }: ContentCardProps) {
  const heightClasses: Record<CardHeight, string> = {
    short: "h-[180px] md:h-[220px]",
    medium: "h-[240px] md:h-[280px]",
    tall: "h-[300px] md:h-[360px]",
  };

  return (
    <div className="relative cursor-pointer group" onClick={onOpen}>
      <div className={`relative ${heightClasses[height]} overflow-hidden rounded-xl bg-gray-100`}>
        <ImageWithFallback
          src={item.img}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="line-clamp-2 font-['NEXON_Football_Gothic'] text-[14px] font-bold text-white">{item.name}</h3>
          <p className="mt-0.5 font-['Noto_Sans_KR'] text-[11px] text-white/80">사용 {item.usedCount}</p>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike?.(item);
          }}
          disabled={disabled}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60"
        >
          <Heart className={`h-4 w-4 transition-all ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
        <Loader2 className="h-4 w-4 animate-spin" />
        레퍼런스 불러오는 중
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

export function ContentExplorePage({ onBack, onNavigate, onHome, onSelectReference }: ContentExplorePageProps) {
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
    void loadReferences();
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

  const leftColumn = useMemo(() => items.filter((_, index) => index % 2 === 0), [items]);
  const rightColumn = useMemo(() => items.filter((_, index) => index % 2 === 1), [items]);

  const getHeight = (index: number): CardHeight => {
    const sequence: CardHeight[] = ["tall", "medium", "short", "medium"];
    return sequence[index % sequence.length];
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-gradient-to-b from-[#fafafa] to-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome ?? (() => onNavigate?.("home"))} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="mx-auto mb-3 flex w-full max-w-[1120px] items-center justify-between px-4 sm:px-8 md:px-10">
        <h1 className="font-['NEXON_Football_Gothic'] text-[clamp(18px,2.2vw,22px)] font-bold text-black">요즘 뜨는 콘텐츠</h1>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#111827] transition-colors hover:border-black"
          onClick={() => onNavigate?.("saved-templates")}
        >
          <Bookmark className="h-4 w-4" />
          저장 목록
        </button>
      </div>

      <div className="page-scroll">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadReferences} />}

        {!loading && !error ? (
          <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 sm:px-8 md:px-10">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex flex-col gap-3 md:gap-4">
                {leftColumn.map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    height={getHeight(index)}
                    onOpen={() => {
                      if (onSelectReference) {
                        onSelectReference(item.id);
                        return;
                      }
                      onNavigate?.("content-aspect-ratio");
                    }}
                    onToggleLike={handleToggleLike}
                    disabled={pendingLikeId === item.id}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3 md:gap-4">
                {rightColumn.map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    height={getHeight(index + 1)}
                    onOpen={() => {
                      if (onSelectReference) {
                        onSelectReference(item.id);
                        return;
                      }
                      onNavigate?.("content-aspect-ratio");
                    }}
                    onToggleLike={handleToggleLike}
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
