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
  const [hasNoticeBadge, setHasNoticeBadge] = useState(false);
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
      const visibleNotices = all.filter((item) => !item.isDraft);
      const visiblePinned = pinned.filter((item) => !item.isDraft);
      setNoticeItems(visibleNotices);
      setPinnedNoticeItems(visiblePinned);
      setHasNoticeBadge(visibleNotices.length > 0 || visiblePinned.length > 0);
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : "공지사항을 불러오지 못했습니다.");
    } finally {
      setNoticeLoading(false);
    }
  };

  useEffect(() => {
    void loadFeaturedReferences();
    void loadNoticeBadge();
  }, []);

  async function loadNoticeBadge() {
    try {
      const notices = await getNoticeList();
      setHasNoticeBadge(notices.some((item) => !item.isDraft));
    } catch {
      setHasNoticeBadge(false);
    }
  }

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
    <div className="home-page-root home-pretendard relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-white md:h-full md:min-h-0">
      <div className="relative mx-auto flex h-full w-full max-w-[1320px] flex-1 flex-col">
        <DefaultTopBar
          title="Person:a"
          onMenuClick={() => setIsMenuOpen(true)}
          onNotificationClick={openNotice}
          showNotificationBadge={hasNoticeBadge}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1140px] flex-col gap-4 md:gap-5">
            <section className="rounded-[26px] border border-[#edf1f5] bg-white p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] md:p-3.5">
              <div className="flex flex-col gap-2 md:gap-3">
                <MainBanner onClick={() => onNavigate?.("diagnosis-start")} />
                <SubBanners
                  onPersonaClick={() => onNavigate?.("persona-list")}
                  onContentClick={() => onNavigate?.("content-aspect-ratio")}
                />
              </div>
            </section>

            <section className="mt-1 rounded-[24px] md:mt-2">
              <SectionHeader onViewAll={() => onNavigate?.("content-explore")} />
              <div className="mt-2 rounded-[22px] border border-[#edf1f5] bg-white p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] md:p-3">
                <FeaturedReferenceSection
                  items={referenceItems}
                  loading={referenceLoading}
                  error={referenceError}
                  pendingLikeId={pendingReferenceLikeId}
                  onToggleLike={handleReferenceBookmarkToggle}
                />
              </div>
            </section>
          </div>
        </div>

      </div>

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          if (page.startsWith("persona")) onTabChange?.("persona");
          if (page.startsWith("content") || page === "saved-templates") onTabChange?.("content");
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
