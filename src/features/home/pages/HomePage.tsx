import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { HamburgerMenu } from '../../../shared/layout/HamburgerMenu';
import { ChevronRight, Bookmark } from 'lucide-react';
import { useState } from 'react';
import imgShutterstock17810092852 from "figma:asset/15fabd854b7cb3b15474b1d58ae3661dd03a76db.png";
import imgImage55 from "figma:asset/ac4448f9289ba74dc8e260cf2469fe907263ed9b.png";
import imgImage56 from "figma:asset/265cd7ba4de44d517944d6e28fbe7a516c2c8937.png";
import imgImage84 from "figma:asset/761f46596218a649ae167df03599465380531f96.png";
import imgRectangle117 from "figma:asset/d172ff08cd7214d515abeaf0da2f756d82f17607.png";
import imgRectangle132 from "figma:asset/f65089cc3d077a6b33562597ca4ec5703b3e9ae7.png";

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
}

function MainBanner({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="group relative h-[200px] mx-6 mb-8 rounded-[24px] overflow-hidden w-[calc(100%-48px)] cursor-pointer shadow-[0_22px_52px_rgba(17,17,17,0.16)] hover:shadow-[0_28px_64px_rgba(17,17,17,0.22)] transition-all duration-500 [perspective:1000px]"
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

      <div className="absolute right-6 bottom-6 text-right text-white">
        <p className="font-['NEXON_Football_Gothic'] font-bold text-[32px] leading-[1.2]">
          나만의
        </p>
        <p className="font-['NEXON_Football_Gothic'] font-bold text-[32px] leading-[1.2]">
          페르소나 만들기
        </p>
      </div>
      <div className="absolute right-6 top-[37%] -translate-y-1/2">
        <div className="rounded-full bg-black/25 border border-white/35 backdrop-blur-[4px] p-2 shadow-[0_10px_22px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-[1.04]">
          <ChevronRight className="w-7 h-7 text-white" />
        </div>
      </div>
    </button>
  );
}

function SubBanners({ onPersonaClick, onContentClick }: { onPersonaClick?: () => void; onContentClick?: () => void }) {
  return (
    <div className="flex gap-4 px-6 mb-8">
      <button
        className="group relative h-[180px] w-[120px] rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] transition-all duration-500 [perspective:900px]"
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

        <div className="absolute bottom-5 left-4 text-left text-white leading-[1.3]">
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[18px]">
            나의
          </p>
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[18px]">
            페르소나
          </p>
        </div>
        <div className="absolute bottom-5 right-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04]">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>

      <button
        className="group relative h-[180px] flex-1 rounded-[20px] overflow-hidden cursor-pointer shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] transition-all duration-500 [perspective:900px]"
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

        <div className="absolute bottom-5 left-4 text-left text-white leading-[1.3]">
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[20px]">
            나만의
          </p>
          <p className="font-['NEXON_Football_Gothic'] font-bold text-[20px]">
            컨텐츠 만들기
          </p>
        </div>
        <div className="absolute bottom-5 right-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04]">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </button>
    </div>
  );
}

function SectionHeader({ onViewAll }: { onViewAll?: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 mb-5">
      <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black">
        요즘 뜨는 컨텐츠
      </h2>
      <button
        className="font-['Noto_Sans_KR'] text-[13px] text-[#888] flex items-center gap-1 hover:text-black transition-colors"
        onClick={onViewAll}
      >
        모두 보기
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  imageStyle?: React.CSSProperties;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string) => void;
}

function ProductCard({ id, image, title, description, imageStyle, isBookmarked, onBookmarkToggle }: ProductCardProps) {
  return (
    <div className="flex-shrink-0 w-[136px] cursor-pointer group">
      <div className="bg-[#f8f8f8] rounded-[16px] h-[180px] mb-3 overflow-hidden relative shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
        <div className="absolute inset-0 transition-transform duration-600 group-hover:rotate-[-1deg] group-hover:scale-[1.02]">
          <img
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
            src={image}
            style={imageStyle}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
        </div>
        <div className="absolute inset-0 rounded-[16px] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] pointer-events-none" />

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle?.(id);
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 active:scale-95 duration-200"
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? 'fill-black text-black' : 'text-black'}`}
          />
        </button>

      </div>
      <p className="font-['Noto_Sans_KR'] font-medium text-[13px] text-black mb-1 px-1">
        {title}
      </p>
      <p className="font-['Noto_Sans_KR'] text-[11px] text-[#888] px-1">
        {description}
      </p>
    </div>
  );
}

function ProductList() {
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-x-auto pb-6 scrollbar-hide">
      <div className="flex gap-3 px-6">
        <ProductCard
          id="cafe-1"
          image="https://images.unsplash.com/photo-1762943483512-3433cfa9569d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBtaW5pbWFsaXN0JTIwY2FmZSUyMGxpZmVzdHlsZXxlbnwxfHx8fDE3Njk3NTc4NzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
          title="카페 일상"
          description="감성 브이로그"
          isBookmarked={bookmarkedItems.has('cafe-1')}
          onBookmarkToggle={handleBookmarkToggle}
        />
        <ProductCard
          id="fashion-1"
          image="https://images.unsplash.com/photo-1753718300087-db3869514f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHJlZXQlMjBmYXNoaW9uJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NzU3ODczfDA&ixlib=rb-4.1.0&q=80&w=1080"
          title="스트릿 룩북"
          description="데일리 패션"
          isBookmarked={bookmarkedItems.has('fashion-1')}
          onBookmarkToggle={handleBookmarkToggle}
        />
        <ProductCard
          id="workspace-1"
          image="https://images.unsplash.com/photo-1609959914470-d50dd6e5850d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwd29ya3NwYWNlJTIwYWVzdGhldGljJTIwZmxhdCUyMGxheXxlbnwxfHx8fDE3Njk3NTc4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
          title="나만의 공간"
          description="워크스페이스"
          isBookmarked={bookmarkedItems.has('workspace-1')}
          onBookmarkToggle={handleBookmarkToggle}
        />
      </div>
    </div>
  );
}

export function HomePage({ onNavigate, onTabChange }: HomePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-16 w-[220px] h-[220px] rounded-full bg-[#f1f2f4] blur-3xl opacity-70" />
        <div className="absolute top-[120px] -right-10 w-[180px] h-[180px] rounded-full bg-[#f6f7f9] blur-3xl opacity-80" />
      </div>
      <DefaultTopBar
        title="Person:a"
        onMenuClick={() => setIsMenuOpen(true)}
        onNotificationClick={() => alert('알림 기능 (준비중)')}
      />

      <div className="pt-2 relative">
        <MainBanner onClick={() => onNavigate?.('diagnosis-start')} />
        <SubBanners
          onPersonaClick={() => onNavigate?.('persona-list')}
          onContentClick={() => onNavigate?.('content-aspect-ratio')}
        />

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#e0e0e0] to-transparent mx-6 mb-6" />

        <SectionHeader onViewAll={() => onNavigate?.('content-explore')} />
        <ProductList />
      </div>

      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentPage="home"
      />
    </div>
  );
}

