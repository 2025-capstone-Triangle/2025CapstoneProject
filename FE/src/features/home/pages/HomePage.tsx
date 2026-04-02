import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { HamburgerMenu } from '../../../shared/layout/HamburgerMenu';
import { ChevronRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';
import { getNoticeList, getPinnedNoticeList, type Notice } from '../../notice/lib/noticeApi';
import {
  getReferenceList,
  toggleReferenceLike,
  type ReferenceStatResponse,
} from '../../content/lib/referenceApi';
import imgShutterstock17810092852 from "figma:asset/15fabd854b7cb3b15474b1d58ae3661dd03a76db.png";
import imgRectangle117 from "figma:asset/d172ff08cd7214d515abeaf0da2f756d82f17607.png";
import imgRectangle132 from "figma:asset/f65089cc3d077a6b33562597ca4ec5703b3e9ae7.png";

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
}

function MainBanner({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="group relative h-[clamp(132px,18vh,220px)] w-full rounded-[24px] overflow-hidden cursor-pointer shadow-[0_22px_52px_rgba(17,17,17,0.16)] transition-transform duration-500 hover:shadow-[0_28px_64px_rgba(17,17,17,0.22)]"
      onClick={onClick}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
        <img
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
          src={imgShutterstock17810092852}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/40 to-black/80" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 top-6 w-[160px] h-[160px] bg-white/10 blur-2xl" />
        </div>
      </div>
      <div
        className="absolute inset-0 rounded-[24px] border border-white/20 backdrop-blur-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] pointer-events-none"
        style={{
          WebkitMaskImage: 'radial-gradient(closest-side, transparent 72%, black 100%)',
          maskImage: 'radial-gradient(closest-side, transparent 72%, black 100%)',
        }}
      />

      <div className="absolute right-6 md:right-8 bottom-6 md:bottom-8 text-right text-white">
        <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(22px,2.9vw,38px)] leading-[1.15]">
          나만의
        </p>
        <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(22px,2.9vw,38px)] leading-[1.15]">
          페르소나 만들기
        </p>
      </div>
      <div className="absolute right-6 md:right-8 top-[37%] -translate-y-1/2">
        <div className="rounded-full bg-black/25 border border-white/35 backdrop-blur-[4px] p-2 shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-[1.04]">
          <ChevronRight className="w-5 h-5 md:w-7 md:h-7 text-white" />
        </div>
      </div>
    </button>
  );
}

function SubBanners({ onPersonaClick, onContentClick }: { onPersonaClick?: () => void; onContentClick?: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 px-0 md:px-2">
      <button
        className="group relative h-[150px] md:h-[162px] lg:h-[182px] w-full rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] transition-all duration-500 [perspective:900px]"
        onClick={onPersonaClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:rotate-[-1.2deg] group-hover:scale-[1.03]">
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.12]"
            src={imgRectangle117}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
        </div>
        <div className="absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] pointer-events-none" />

        <div className="absolute bottom-5 left-4 text-left text-white leading-[1.2]">
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(15px,1.45vw,20px)]">
            나의
          </p>
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(15px,1.45vw,20px)]">
            페르소나
          </p>
        </div>
        <div className="absolute bottom-5 right-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04]">
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
      </button>

      <button
        className="group relative h-[150px] md:h-[162px] lg:h-[182px] w-full rounded-[20px] overflow-hidden cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] transition-all duration-500 [perspective:900px]"
        onClick={onContentClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:rotate-[1deg] group-hover:scale-[1.03]">
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
            src={imgRectangle132}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
        </div>
        <div className="absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] pointer-events-none" />

        <div className="absolute bottom-5 left-4 text-left text-white leading-[1.2]">
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(16px,1.6vw,22px)]">
            나만의
          </p>
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(16px,1.6vw,22px)]">
            컨텐츠 만들기
          </p>
        </div>
        <div className="absolute bottom-5 right-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04]">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </button>
    </div>
  );
}

function SectionHeader({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 lg:px-10 mb-2 md:mb-3">
      <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[clamp(17px,1.7vw,24px)] text-black">
        요즘 뜨는 컨텐츠
      </h2>
      <button
        className="font-['Noto_Sans_KR'] text-[clamp(12px,1.1vw,13px)] text-[#888] flex items-center gap-1 hover:text-black transition-colors"
        onClick={onViewAll}
      >
        모두 보기
        <ChevronRight className="w-4 h-4" />
      </button>
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
      <div className="relative group cursor-pointer">
        <div className="relative h-[96px] sm:h-[108px] md:h-[145px] lg:h-[168px] rounded-[14px] md:rounded-[16px] overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_14px_24px_rgba(0,0,0,0.18)]">
          <ImageWithFallback
            alt={item.name}
            src={item.img}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleLike(item);
            }}
            disabled={pendingLikeId !== null && pendingLikeId !== item.id}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
          >
            <Heart
              className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all ${item.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>
        </div>
        <div className="mt-1.5 md:mt-2">
          <p className="font-['Noto_Sans_KR'] font-semibold text-[10px] sm:text-[11px] md:text-[13px] text-black line-clamp-1">{item.name}</p>
          <p className="hidden md:block font-['Noto_Sans_KR'] text-[11px] text-[#888] mt-1 line-clamp-2">{item.description ?? "설명 없음"}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedReferenceSection({ items, loading, error, pendingLikeId, onToggleLike }: FeaturedSectionProps) {
  if (loading) {
    return (
      <div className="min-h-[120px] flex items-center justify-center px-6">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">요즘 뜨는 콘텐츠를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-[#efefef] bg-white px-6 py-4 mx-6 mt-4">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#d92d20]">{error}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[16px] border border-[#efefef] bg-white px-6 py-4 mx-6 mt-4">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">현재 등록된 콘텐츠가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 px-2">
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

export function HomePage({ onNavigate, onTabChange }: HomePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeError, setNoticeError] = useState("");
  const [noticeItems, setNoticeItems] = useState<Notice[]>([]);
  const [pinnedNoticeItems, setPinnedNoticeItems] = useState<Notice[]>([]);
  const [referenceItems, setReferenceItems] = useState<ReferenceStatResponse[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [referenceError, setReferenceError] = useState("");
  const [pendingReferenceLikeId, setPendingReferenceLikeId] = useState<number | null>(null);

  const openNotice = async () => {
    setNoticeOpen(true);
    setNoticeLoading(true);
    setNoticeError("");
    try {
      const [all, pinned] = await Promise.all([getNoticeList(), getPinnedNoticeList()]);
      setNoticeItems(all.filter((item) => !item.isDraft));
      setPinnedNoticeItems(pinned.filter((item) => !item.isDraft));
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : "공지 조회 실패");
    } finally {
      setNoticeLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedReferences();
  }, []);

  async function loadFeaturedReferences() {
    setReferenceLoading(true);
    setReferenceError("");
    try {
      const data = await getReferenceList();
      setReferenceItems(data.slice(0, 3));
    } catch (err) {
      setReferenceError(err instanceof Error ? err.message : "콘텐츠 불러오기 실패");
    } finally {
      setReferenceLoading(false);
    }
  }

  const handleReferenceBookmarkToggle = async (target: ReferenceStatResponse) => {
    if (pendingReferenceLikeId !== null) return;

    const nextLiked = !target.isLiked;
    setPendingReferenceLikeId(target.id);
    setReferenceItems((prev) =>
      prev.map((item) => (item.id === target.id ? { ...item, isLiked: nextLiked } : item))
    );

    try {
      await toggleReferenceLike({ id: target.id, like: nextLiked });
    } catch {
      setReferenceItems((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, isLiked: target.isLiked } : item))
      );
    } finally {
      setPendingReferenceLikeId(null);
    }
  };

  return (
    <div className="home-page-root bg-gradient-to-b from-[#fafafa] to-white min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-16 w-[220px] h-[220px] rounded-full bg-[#f1f2f4] blur-3xl opacity-70" />
        <div className="absolute top-[120px] -right-10 w-[180px] h-[180px] rounded-full bg-[#f6f7f9] blur-3xl opacity-80" />
      </div>
      <div className="relative mx-auto flex h-full max-w-[1200px] flex-col gap-4 px-4 py-4 md:px-6 lg:px-10">
        <DefaultTopBar
          title="Person:a"
          onMenuClick={() => setIsMenuOpen(true)}
          onNotificationClick={openNotice}
        />
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full flex-col justify-start gap-2 md:gap-3">
          <div className="flex flex-col gap-2 md:gap-3 pt-3 md:pt-4">
            <MainBanner onClick={() => onNavigate?.("diagnosis-start")} />
            <SubBanners
              onPersonaClick={() => onNavigate?.("persona-list")}
              onContentClick={() => onNavigate?.("content-aspect-ratio")}
            />
            <div className="mt-4 md:mt-6">
              <SectionHeader onViewAll={() => onNavigate?.("content-explore")} />
            </div>
          </div>
          <div className="min-h-0 overflow-hidden">
            <FeaturedReferenceSection
              items={referenceItems}
              loading={referenceLoading}
              error={referenceError}
              pendingLikeId={pendingReferenceLikeId}
              onToggleLike={handleReferenceBookmarkToggle}
            />
          </div>
        </div>
      </div>
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={onNavigate}
          currentPage="home"
        />
      </div>

      {noticeOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-5" onClick={() => setNoticeOpen(false)}>
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-2xl border border-[#ececec]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['NEXON_Football_Gothic'] text-[18px] text-black mb-3">공지사항</h3>
            {noticeLoading ? (
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">불러오는 중...</p>
            ) : noticeError ? (
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#d92d20]">{noticeError}</p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto space-y-2">
                {pinnedNoticeItems.map((item) => (
                  <article key={`p-${item.id}`} className="rounded-[12px] border border-[#ffd9e3] bg-[#fff4f7] px-3 py-2">
                    <p className="font-['Noto_Sans_KR'] text-[11px] text-[#EF466F] mb-1">고정 공지</p>
                    <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{item.title}</p>
                    <p className="font-['Noto_Sans_KR'] text-[12px] text-[#555] mt-1">{item.content}</p>
                  </article>
                ))}
                {noticeItems.map((item) => (
                  <article key={item.id} className="rounded-[12px] border border-[#efefef] bg-white px-3 py-2">
                    <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{item.title}</p>
                    <p className="font-['Noto_Sans_KR'] text-[12px] text-[#555] mt-1">{item.content}</p>
                  </article>
                ))}
                {noticeItems.length === 0 && pinnedNoticeItems.length === 0 ? (
                  <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">등록된 공지가 없습니다.</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}


