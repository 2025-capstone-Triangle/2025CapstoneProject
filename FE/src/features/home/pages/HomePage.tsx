import { useEffect, useState } from "react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { HamburgerMenu } from "../../../shared/layout/HamburgerMenu";
import { getNoticeList, getPinnedNoticeList, type Notice } from "../../notice/lib/noticeApi";
import {
  getReferenceList,
  toggleReferenceLike,
  type ReferenceStatResponse,
} from "../../content/lib/referenceApi";
import { MainBanner, SubBanners } from "../components/HomeBanners";
import {
  FeaturedReferenceSection,
  SectionHeader,
} from "../components/FeaturedReferenceSection";
import { NoticeBottomSheet } from "../components/NoticeBottomSheet";

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: "home" | "persona" | "content") => void;
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
      setNoticeError(err instanceof Error ? err.message : "공지사항을 불러오지 못했습니다.");
    } finally {
      setNoticeLoading(false);
    }
  };

  useEffect(() => {
    void loadFeaturedReferences();
  }, []);

  async function loadFeaturedReferences() {
    setReferenceLoading(true);
    setReferenceError("");
    try {
      const data = await getReferenceList();
      setReferenceItems(data.slice(0, 3));
    } catch (err) {
      setReferenceError(err instanceof Error ? err.message : "추천 콘텐츠를 불러오지 못했습니다.");
    } finally {
      setReferenceLoading(false);
    }
  }

  const handleReferenceBookmarkToggle = async (target: ReferenceStatResponse) => {
    if (pendingReferenceLikeId !== null) return;

    const nextLiked = !target.isLiked;
    setPendingReferenceLikeId(target.id);
    setReferenceItems((prev) =>
      prev.map((item) => (item.id === target.id ? { ...item, isLiked: nextLiked } : item)),
    );

    try {
      await toggleReferenceLike({ id: target.id, like: nextLiked });
    } catch {
      setReferenceItems((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, isLiked: target.isLiked } : item)),
      );
    } finally {
      setPendingReferenceLikeId(null);
    }
  };

  return (
    <div className="home-page-root relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-[#fafafa] to-white md:h-full md:min-h-0">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-20 h-[220px] w-[220px] rounded-full bg-[#f1f2f4] opacity-70 blur-3xl" />
        <div className="absolute -right-10 top-[120px] h-[180px] w-[180px] rounded-full bg-[#f6f7f9] opacity-80 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-[1320px] flex-1 flex-col">
        <DefaultTopBar
          title="Person:a"
          onMenuClick={() => setIsMenuOpen(true)}
          onNotificationClick={openNotice}
        />

        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-3 pt-3 md:px-6 md:pb-5 md:pt-4 xl:px-8">
          <div className="flex h-full flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-2 pt-2 md:gap-3 md:pt-3">
              <MainBanner onClick={() => onNavigate?.("diagnosis-start")} />
              <SubBanners
                onPersonaClick={() => onNavigate?.("persona-list")}
                onContentClick={() => onNavigate?.("content-aspect-ratio")}
              />
              <div className="mt-2 md:mt-4">
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

      </div>

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          if (page === "persona-list") onTabChange?.("persona");
          if (page === "content-aspect-ratio") onTabChange?.("content");
          onNavigate?.(page);
        }}
        currentPage="home"
      />

      <NoticeBottomSheet
        open={noticeOpen}
        loading={noticeLoading}
        error={noticeError}
        pinnedItems={pinnedNoticeItems}
        items={noticeItems}
        onClose={() => setNoticeOpen(false)}
      />
    </div>
  );
}
