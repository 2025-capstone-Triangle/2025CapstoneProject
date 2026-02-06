import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { BottomTab } from '../../../shared/layout/BottomTab';
import { Heart, Download, Filter, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PersonaSavedContentsPageProps {
  onBack?: () => void;
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
  onHome?: () => void;
  onCreateContent?: () => void;
}

const allContents = [
  { id: 1, ratio: '1:1', type: '프로필용', date: '2025.01.29' },
  { id: 2, ratio: '4:5', type: '피드용', date: '2025.01.28' },
  { id: 3, ratio: '9:16', type: '스토리용', date: '2025.01.28' },
  { id: 4, ratio: '4:5', type: '피드용', date: '2025.01.27' },
  { id: 5, ratio: '1:1', type: '프로필용', date: '2025.01.26' },
  { id: 6, ratio: '9:16', type: '스토리용', date: '2025.01.25' },
  { id: 7, ratio: '4:5', type: '피드용', date: '2025.01.24' },
  { id: 8, ratio: '1:1', type: '프로필용', date: '2025.01.23' },
  { id: 9, ratio: '9:16', type: '스토리용', date: '2025.01.22' },
];

type FilterType = 'all' | '1:1' | '4:5' | '9:16' | 'liked';
type SortType = 'recent' | 'liked-first';

export function PersonaSavedContentsPage({ onBack, onTabChange, onHome, onCreateContent }: PersonaSavedContentsPageProps) {
  const [likedContents, setLikedContents] = useState<Set<number>>(new Set([1, 3, 5]));
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [expandedImage, setExpandedImage] = useState<number | null>(null);

  const toggleLike = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newLiked = new Set(likedContents);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedContents(newLiked);
  };

  const filteredContents = filter === 'all' 
    ? allContents 
    : filter === 'liked'
    ? allContents.filter(c => likedContents.has(c.id))
    : allContents.filter(c => c.ratio === filter);

  const sortedContents = sortBy === 'liked-first'
    ? [...filteredContents].sort((a, b) => {
        const aLiked = likedContents.has(a.id);
        const bLiked = likedContents.has(b.id);
        if (aLiked && !bLiked) return -1;
        if (!aLiked && bLiked) return 1;
        return 0;
      })
    : filteredContents;

  const handleImageClick = (id: number) => {
    setExpandedImage(id);
  };

  const handleNextImage = () => {
    if (expandedImage === null) return;
    const currentIndex = sortedContents.findIndex(c => c.id === expandedImage);
    const nextIndex = (currentIndex + 1) % sortedContents.length;
    setExpandedImage(sortedContents[nextIndex].id);
  };

  const handlePrevImage = () => {
    if (expandedImage === null) return;
    const currentIndex = sortedContents.findIndex(c => c.id === expandedImage);
    const prevIndex = (currentIndex - 1 + sortedContents.length) % sortedContents.length;
    setExpandedImage(sortedContents[prevIndex].id);
  };

  const expandedContent = allContents.find(c => c.id === expandedImage);

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto pb-[80px]">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="flex-1 overflow-y-auto px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-2 leading-tight">
            저장된 콘텐츠
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            차분한 도시인 · 총 {allContents.length}개
          </p>
        </div>

        {/* Create Content Button */}
        <button
          onClick={onCreateContent}
          className="w-full bg-gradient-to-r from-black to-[#2d2d2d] rounded-[16px] h-[52px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all mb-6"
        >
          <Sparkles className="w-4.5 h-4.5" />
          새 콘텐츠 만들기
        </button>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-4">
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] font-medium">
            {sortBy === 'recent' ? '최신순' : '즐겨찾기 먼저'}
          </p>
          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'liked-first' : 'recent')}
            className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full font-['Noto_Sans_KR'] text-[12px] font-medium text-[#6b6b6b] hover:border-black transition-colors flex items-center gap-1.5"
          >
            <Heart className={`w-3 h-3 ${sortBy === 'liked-first' ? 'fill-red-500 text-red-500' : ''}`} />
            정렬
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-['Noto_Sans_KR'] text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-[#6b6b6b] border border-[#e5e5e5] hover:border-black'
            }`}
          >
            전체 ({allContents.length})
          </button>
          <button
            onClick={() => setFilter('1:1')}
            className={`px-4 py-2 rounded-full font-['Noto_Sans_KR'] text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === '1:1'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-[#6b6b6b] border border-[#e5e5e5] hover:border-black'
            }`}
          >
            1:1 ({allContents.filter(c => c.ratio === '1:1').length})
          </button>
          <button
            onClick={() => setFilter('4:5')}
            className={`px-4 py-2 rounded-full font-['Noto_Sans_KR'] text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === '4:5'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-[#6b6b6b] border border-[#e5e5e5] hover:border-black'
            }`}
          >
            4:5 ({allContents.filter(c => c.ratio === '4:5').length})
          </button>
          <button
            onClick={() => setFilter('9:16')}
            className={`px-4 py-2 rounded-full font-['Noto_Sans_KR'] text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === '9:16'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-[#6b6b6b] border border-[#e5e5e5] hover:border-black'
            }`}
          >
            9:16 ({allContents.filter(c => c.ratio === '9:16').length})
          </button>
          <button
            onClick={() => setFilter('liked')}
            className={`px-4 py-2 rounded-full font-['Noto_Sans_KR'] text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'liked'
                ? 'bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] text-white shadow-md'
                : 'bg-white text-[#6b6b6b] border border-[#e5e5e5] hover:border-[#EF466F]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filter === 'liked' ? 'fill-white' : ''}`} />
            즐겨찾기 ({likedContents.size})
          </button>
        </div>

        {/* Content Grid - Beautiful Design */}
        <div className="grid grid-cols-2 gap-4">
          {sortedContents.map((content) => (
            <div
              key={content.id}
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(content.id)}
            >
              {/* Card Wrapper */}
              <div className="bg-white rounded-[16px] p-3 shadow-md hover:shadow-xl transition-all">
                {/* Image */}
                <div className={`w-full bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[12px] overflow-hidden mb-3 relative ${
                  content.ratio === '1:1' ? 'aspect-square' :
                  content.ratio === '4:5' ? 'aspect-[4/5]' :
                  content.ratio === '9:16' ? 'aspect-[9/16]' :
                  'aspect-square'
                }`}>
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg z-10">
                    <span className="font-['Noto_Sans_KR'] text-[10px] text-white font-semibold">
                      {content.type}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between px-1">
                  <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b6b6b] font-medium">
                    {content.date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => toggleLike(content.id, e)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${likedContents.has(content.id) ? 'fill-red-500 text-red-500' : 'text-[#d0d0d0]'}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6b6b6b]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] rounded-full flex items-center justify-center mb-4 shadow-sm">
              {filter === 'liked' ? (
                <Heart className="w-8 h-8 text-[#d0d0d0]" />
              ) : (
                <Filter className="w-8 h-8 text-[#d0d0d0]" />
              )}
            </div>
            <p className="font-['NEXON_Football_Gothic'] font-bold text-[16px] text-black mb-1">
              {filter === 'liked' ? '즐겨찾기한 콘텐츠가 없습니다' : '콘텐츠가 없습니다'}
            </p>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] text-center">
              {filter === 'liked' 
                ? '하트를 눌러 콘텐츠를 즐겨찾기 해보세요' 
                : '해당 비율의 콘텐츠가 없습니다'}
            </p>
          </div>
        )}
      </div>

      <BottomTab activeTab="persona" onTabChange={onTabChange} />

      {/* Image Expanded Modal */}
      {expandedImage !== null && expandedContent && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="bg-black/50 backdrop-blur-md p-6 flex items-center justify-between">
            <div>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-white/80">
                {expandedContent.type}
              </p>
              <p className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-white">
                {expandedContent.date}
              </p>
            </div>
            <button
              onClick={() => setExpandedImage(null)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center relative px-8">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Main Image */}
            <div className={`w-full bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[24px] shadow-2xl ${
              expandedContent.ratio === '1:1' ? 'aspect-square max-w-[320px]' :
              expandedContent.ratio === '4:5' ? 'aspect-[4/5] max-w-[280px]' :
              expandedContent.ratio === '9:16' ? 'aspect-[9/16] max-w-[240px]' :
              'aspect-square max-w-[320px]'
            }`} />

            <button
              onClick={handleNextImage}
              className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Actions */}
          <div className="bg-black/50 backdrop-blur-md p-6">
            <div className="flex gap-3 max-w-[390px] mx-auto">
              <button
                onClick={(e) => {
                  toggleLike(expandedImage, e);
                }}
                className={`flex-1 rounded-[16px] h-[52px] font-['Noto_Sans_KR'] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all ${
                  likedContents.has(expandedImage)
                    ? 'bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedContents.has(expandedImage) ? 'fill-white' : ''}`} />
                {likedContents.has(expandedImage) ? '즐겨찾기 해제' : '즐겨찾기'}
              </button>
              <button className="flex-1 bg-white rounded-[16px] h-[52px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-black flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Download className="w-5 h-5" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


