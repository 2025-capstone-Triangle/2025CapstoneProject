import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Download, Heart, Loader2, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { BottomTab } from "../../../shared/layout/BottomTab";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { deleteContent, getContentListByPersonaCode, toggleContentLike, type ContentStatResponse } from "../../content/lib/contentApi";
import { mapContentTypeToRatio, ratioToAspectClass } from "../../content/lib/contentType";

interface PersonaSavedContentsPageProps {
  personaCode?: string;
  onBack?: () => void;
  onTabChange?: (tab: "home" | "persona" | "content") => void;
  onHome?: () => void;
  onCreateContent?: () => void;
}

type FilterType = "all" | "1:1" | "4:5" | "9:16" | "liked";
type SortType = "recent" | "liked-first";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatDate(dateRaw: string) {
  if (!dateRaw) return "-";
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function PersonaSavedContentsPage({ personaCode, onBack, onTabChange, onHome, onCreateContent }: PersonaSavedContentsPageProps) {
  const [contents, setContents] = useState<ContentStatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [expandedImage, setExpandedImage] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [likePendingIds, setLikePendingIds] = useState<number[]>([]);

  const loadContents = async () => {
    setLoading(true);
    setError("");
    setActionError("");

    if (!personaCode) {
      setContents([]);
      setError("선택된 페르소나 코드가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      const data = await getContentListByPersonaCode(personaCode);
      setContents(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "콘텐츠를 불러오지 못했습니다."));
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, [personaCode]);

  const personaName = contents[0]?.persona?.name ?? "선택한 페르소나";

  const filteredContents = useMemo(() => {
    if (filter === "all") return contents;
    if (filter === "liked") return contents.filter((item) => item.isLiked);
    return contents.filter((item) => mapContentTypeToRatio(item.type) === filter);
  }, [contents, filter]);

  const sortedContents = useMemo(() => {
    if (sortBy === "recent") {
      return [...filteredContents].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    return [...filteredContents].sort((a, b) => {
      if (a.isLiked && !b.isLiked) return -1;
      if (!a.isLiked && b.isLiked) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredContents, sortBy]);

  const expandedIndex = expandedImage === null ? -1 : sortedContents.findIndex((item) => item.id === expandedImage);
  const expandedContent = expandedIndex >= 0 ? sortedContents[expandedIndex] : null;

  const toggleLike = async (id: number, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    const target = contents.find((item) => item.id === id);
    if (!target) return;

    const nextLike = !target.isLiked;
    setActionError("");
    setLikePendingIds((prev) => [...prev, id]);
    setContents((prev) => prev.map((item) => (item.id === id ? { ...item, isLiked: nextLike } : item)));

    try {
      await toggleContentLike(id, nextLike);
    } catch (toggleError) {
      setContents((prev) => prev.map((item) => (item.id === id ? { ...item, isLiked: !nextLike } : item)));
      setActionError(getErrorMessage(toggleError, "북마크 변경에 실패했습니다."));
    } finally {
      setLikePendingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleDeleteContent = async (id: number, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setActionError("");
    setDeletingId(id);

    try {
      await deleteContent(id);
      setContents((prev) => prev.filter((item) => item.id !== id));
      if (expandedImage === id) {
        setExpandedImage(null);
      }
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError, "콘텐츠 삭제에 실패했습니다."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleNextImage = () => {
    if (!expandedContent || sortedContents.length === 0) return;
    const nextIndex = (expandedIndex + 1) % sortedContents.length;
    setExpandedImage(sortedContents[nextIndex].id);
  };

  const handlePrevImage = () => {
    if (!expandedContent || sortedContents.length === 0) return;
    const prevIndex = (expandedIndex - 1 + sortedContents.length) % sortedContents.length;
    setExpandedImage(sortedContents[prevIndex].id);
  };

  const ratioCount = (ratio: "1:1" | "4:5" | "9:16") => contents.filter((item) => mapContentTypeToRatio(item.type) === ratio).length;
  const likedCount = contents.filter((item) => item.isLiked).length;

  return (
    <div className="persona-page-root persona-pretendard relative mx-auto flex h-[100dvh] min-h-[100dvh] w-full max-w-[1320px] flex-col overflow-hidden bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome} showNotification={true} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      <div className="page-scroll">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-[92px] pt-8 sm:px-8 md:px-10 md:pb-8">
        <div className="mb-5">
          <h2 className="mb-1 font-['NEXON_Football_Gothic'] text-[clamp(24px,2.7vw,30px)] font-bold text-black">저장된 콘텐츠</h2>
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
            {personaName} · 총 {contents.length}개
          </p>
        </div>

        <button
          onClick={onCreateContent}
          className="mb-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[14px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] sm:h-[52px]"
        >
          <Sparkles className="w-4 h-4" />
          이 페르소나로 새 콘텐츠 만들기
        </button>

        <div className="flex items-center justify-between mb-4">
          <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">{sortBy === "recent" ? "최신순" : "즐겨찾기 우선"}</p>
          <button
            onClick={() => setSortBy((prev) => (prev === "recent" ? "liked-first" : "recent"))}
            className="h-[32px] px-3 rounded-full border border-[#e2e2e2] bg-white font-['Noto_Sans_KR'] text-[12px] text-[#555]"
          >
            정렬 변경
          </button>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-2 rounded-full font-['Noto_Sans_KR'] text-[12px] whitespace-nowrap ${
              filter === "all" ? "bg-black text-white" : "bg-white border border-[#e5e5e5] text-[#666]"
            }`}
          >
            전체 ({contents.length})
          </button>
          <button
            onClick={() => setFilter("1:1")}
            className={`px-3.5 py-2 rounded-full font-['Noto_Sans_KR'] text-[12px] whitespace-nowrap ${
              filter === "1:1" ? "bg-black text-white" : "bg-white border border-[#e5e5e5] text-[#666]"
            }`}
          >
            1:1 ({ratioCount("1:1")})
          </button>
          <button
            onClick={() => setFilter("4:5")}
            className={`px-3.5 py-2 rounded-full font-['Noto_Sans_KR'] text-[12px] whitespace-nowrap ${
              filter === "4:5" ? "bg-black text-white" : "bg-white border border-[#e5e5e5] text-[#666]"
            }`}
          >
            4:5 ({ratioCount("4:5")})
          </button>
          <button
            onClick={() => setFilter("9:16")}
            className={`px-3.5 py-2 rounded-full font-['Noto_Sans_KR'] text-[12px] whitespace-nowrap ${
              filter === "9:16" ? "bg-black text-white" : "bg-white border border-[#e5e5e5] text-[#666]"
            }`}
          >
            9:16 ({ratioCount("9:16")})
          </button>
          <button
            onClick={() => setFilter("liked")}
            className={`px-3.5 py-2 rounded-full font-['Noto_Sans_KR'] text-[12px] whitespace-nowrap ${
              filter === "liked" ? "bg-[#EF466F] text-white" : "bg-white border border-[#e5e5e5] text-[#666]"
            }`}
          >
            즐겨찾기 ({likedCount})
          </button>
        </div>

        {loading && (
          <div className="h-[240px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
            <Loader2 className="w-4 h-4 animate-spin" />
            콘텐츠 불러오는 중
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[14px] border border-[#f0d0d0] bg-[#fff7f7] p-4 mb-4">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b] mb-2">{error}</p>
            <button
              onClick={loadContents}
              className="h-[34px] px-3 rounded-[9px] bg-black text-white text-[12px] font-['Noto_Sans_KR'] inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && actionError && (
          <div className="rounded-[12px] border border-[#f0d0d0] bg-[#fff7f7] p-3 mb-4">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b]">{actionError}</p>
          </div>
        )}

        {!loading && !error && sortedContents.length === 0 && (
          <div className="rounded-[14px] border border-[#ececec] bg-[#fafafa] p-5 text-center">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">조건에 맞는 콘텐츠가 없습니다.</p>
          </div>
        )}

        {!loading && !error && sortedContents.length > 0 && (
          <div className="columns-2 pb-4 [column-gap:0.75rem] sm:columns-3 xl:columns-4">
            {sortedContents.map((content) => {
              const ratio = mapContentTypeToRatio(content.type);
              const likePending = likePendingIds.includes(content.id);
              const isDeleting = deletingId === content.id;

              return (
                <div
                  key={content.id}
                  className="mb-3 break-inside-avoid cursor-pointer rounded-[16px] border border-[#efefef] bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => setExpandedImage(content.id)}
                >
                  <div
                    className={`rounded-[12px] overflow-hidden bg-[#e6e6e6] relative ${ratioToAspectClass(ratio)}`}
                  >
                    {content.img ? (
                      <img src={content.img} alt={`content-${content.id}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#d9d9d9] to-[#b9b9b9]" />
                    )}

                    <div className="absolute left-1.5 bottom-1.5 px-2 py-0.5 rounded-[6px] bg-white/90 text-[10px] font-['Noto_Sans_KR'] font-semibold">
                      {ratio}
                    </div>
                    <button
                      onClick={(event) => toggleLike(content.id, event)}
                      disabled={likePending}
                      className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-60"
                    >
                      {likePending ? (
                        <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
                      ) : (
                        <Heart className={`w-3.5 h-3.5 ${content.isLiked ? "fill-black text-black" : "text-black"}`} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 px-1 flex items-center justify-between">
                    <span className="font-['Noto_Sans_KR'] text-[10px] text-[#666]">{formatDate(content.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(event) => event.stopPropagation()}
                        className="w-6 h-6 rounded-full hover:bg-[#f3f3f3] flex items-center justify-center"
                      >
                        <Download className="w-3.5 h-3.5 text-[#666]" />
                      </button>
                      <button
                        onClick={(event) => handleDeleteContent(content.id, event)}
                        disabled={isDeleting}
                        className="w-6 h-6 rounded-full hover:bg-[#fff1f3] flex items-center justify-center disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#EF466F] animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-[#EF466F]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      <BottomTab activeTab="persona" onTabChange={onTabChange} />

      {expandedContent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between bg-black/60 p-4 backdrop-blur-md sm:p-5">
            <div>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-white/80">{formatDate(expandedContent.createdAt)}</p>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-white font-semibold">{mapContentTypeToRatio(expandedContent.type)}</p>
            </div>
            <button onClick={() => setExpandedImage(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 sm:px-10">
            <button onClick={handlePrevImage} className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 sm:left-4">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div
              className={`w-full rounded-[20px] overflow-hidden bg-[#d6d6d6] ${
                mapContentTypeToRatio(expandedContent.type) === "1:1"
                  ? "aspect-square max-w-[82vw] md:max-w-[560px]"
                  : mapContentTypeToRatio(expandedContent.type) === "4:5"
                    ? "aspect-[4/5] max-w-[76vw] md:max-w-[460px]"
                    : "aspect-[9/16] max-w-[62vw] md:max-w-[340px]"
              }`}
            >
              {expandedContent.img ? (
                <img src={expandedContent.img} alt={`content-${expandedContent.id}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#d9d9d9] to-[#b9b9b9]" />
              )}
            </div>

            <button onClick={handleNextImage} className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 sm:right-4">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="bg-black/60 p-4 backdrop-blur-md sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={(event) => toggleLike(expandedContent.id, event)}
                className={`h-[48px] rounded-[14px] font-['Noto_Sans_KR'] text-[14px] font-semibold flex items-center justify-center gap-1.5 ${
                  expandedContent.isLiked ? "bg-white text-black" : "bg-white/10 text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${expandedContent.isLiked ? "fill-black text-black" : ""}`} />
                {expandedContent.isLiked ? "북마크 해제" : "북마크"}
              </button>
              <button
                onClick={(event) => handleDeleteContent(expandedContent.id, event)}
                disabled={deletingId === expandedContent.id}
                className="h-[48px] rounded-[14px] bg-[#EF466F] text-white font-['Noto_Sans_KR'] text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {deletingId === expandedContent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
