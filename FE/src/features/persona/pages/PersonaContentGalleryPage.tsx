import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { Heart, Download, X } from 'lucide-react';
import { useState } from 'react';

interface PersonaContentGalleryPageProps {
  onBack?: () => void;
  onHome?: () => void;
}

const allContents = [
  { id: 1, ratio: '1:1', type: '프로필용', gradient: 'from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d]' },
  { id: 2, ratio: '4:5', type: '피드용', gradient: 'from-[#4a4a4a] via-[#5a5a5a] to-[#3a3a3a]' },
  { id: 3, ratio: '9:16', type: '스토리용', gradient: 'from-[#1a1a1a] via-[#2a2a2a] to-[#0a0a0a]' },
  { id: 4, ratio: '4:5', type: '피드용', gradient: 'from-[#3d3d3d] via-[#4d4d4d] to-[#2d2d2d]' },
  { id: 5, ratio: '1:1', type: '프로필용', gradient: 'from-[#505050] via-[#606060] to-[#404040]' },
  { id: 6, ratio: '9:16', type: '스토리용', gradient: 'from-[#252525] via-[#353535] to-[#151515]' },
  { id: 7, ratio: '4:5', type: '피드용', gradient: 'from-[#424242] via-[#525252] to-[#323232]' },
  { id: 8, ratio: '1:1', type: '프로필용', gradient: 'from-[#383838] via-[#484848] to-[#282828]' },
  { id: 9, ratio: '4:5', type: '피드용', gradient: 'from-[#2f2f2f] via-[#3f3f3f] to-[#1f1f1f]' },
  { id: 10, ratio: '9:16', type: '스토리용', gradient: 'from-[#1c1c1c] via-[#2c2c2c] to-[#0c0c0c]' },
  { id: 11, ratio: '1:1', type: '프로필용', gradient: 'from-[#454545] via-[#555555] to-[#353535]' },
  { id: 12, ratio: '4:5', type: '피드용', gradient: 'from-[#363636] via-[#464646] to-[#262626]' },
];

export function PersonaContentGalleryPage({ onBack, onHome }: PersonaContentGalleryPageProps) {
  const [likedContents, setLikedContents] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] = useState<typeof allContents[0] | null>(null);

  const toggleLike = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newLiked = new Set(likedContents);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedContents(newLiked);
  };

  // Sort: liked contents first
  const sortedContents = [...allContents].sort((a, b) => {
    const aLiked = likedContents.has(a.id);
    const bLiked = likedContents.has(b.id);
    if (aLiked && !bLiked) return -1;
    if (!aLiked && bLiked) return 1;
    return 0;
  });

  // Split into two columns
  const leftColumn = sortedContents.filter((_, index) => index % 2 === 0);
  const rightColumn = sortedContents.filter((_, index) => index % 2 === 1);

  const renderCard = (content: typeof allContents[0]) => (
    <div
      key={content.id}
      className="cursor-pointer group mb-3"
      onClick={() => setSelectedContent(content)}
    >
      <div className={`w-full bg-gradient-to-br ${content.gradient} rounded-[16px] overflow-hidden shadow-sm group-hover:shadow-lg transition-all relative ${
        content.ratio === '1:1' ? 'aspect-square' :
        content.ratio === '4:5' ? 'aspect-[4/5]' :
        content.ratio === '9:16' ? 'aspect-[9/16]' :
        'aspect-square'
      }`}>
        {/* Content Visual Elements */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="font-['NEXON_Football_Gothic'] text-white text-[20px] font-bold mb-2 opacity-80">
              차분한 도시인
            </div>
            <div className="font-['Noto_Sans_KR'] text-white/60 text-[12px]">
              {content.type === '프로필용' ? '프로필 이미지' : 
               content.type === '피드용' ? '피드 게시물' : 
               '스토리 콘텐츠'}
            </div>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-lg rotate-45" />
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md z-10">
          <span className="font-['Noto_Sans_KR'] text-[10px] text-white font-semibold">
            {content.type}
          </span>
        </div>

        {/* Ratio Badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md z-10">
          <span className="font-['Noto_Sans_KR'] text-[10px] text-black font-semibold">
            {content.ratio}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(content.id);
            }}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 duration-200"
          >
            <Heart 
              className={`w-4.5 h-4.5 ${likedContents.has(content.id) ? 'fill-black text-black' : 'text-black'}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 duration-200"
          >
            <Download className="w-4.5 h-4.5 text-black" />
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  return (
    <div className="persona-page-root persona-pretendard relative min-h-screen max-w-[390px] mx-auto overflow-hidden bg-white">
      <DefaultTopBar onTitleClick={onHome} showNotification={true} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[24px] text-black mb-2">
          저장된 콘텐츠
        </h1>
        <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
          차분한 도시인 · {allContents.length}개
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="px-6 pb-8">
        <div className="flex gap-3">
          {/* Left Column */}
          <div className="flex-1">
            {leftColumn.map(content => renderCard(content))}
          </div>
          
          {/* Right Column */}
          <div className="flex-1">
            {rightColumn.map(content => renderCard(content))}
          </div>
        </div>
      </div>

      {/* Modal - Zoom View */}
      {selectedContent && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center max-w-[390px] mx-auto"
          onClick={() => setSelectedContent(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedContent(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Content */}
          <div className="px-6 w-full" onClick={(e) => e.stopPropagation()}>
            <div className={`w-full bg-gradient-to-br ${selectedContent.gradient} rounded-[24px] overflow-hidden shadow-2xl relative ${
              selectedContent.ratio === '1:1' ? 'aspect-square' :
              selectedContent.ratio === '4:5' ? 'aspect-[4/5]' :
              selectedContent.ratio === '9:16' ? 'aspect-[9/16]' :
              'aspect-square'
            }`}>
              {/* Content Visual Elements */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="font-['NEXON_Football_Gothic'] text-white text-[28px] font-bold mb-3 opacity-90">
                    차분한 도시인
                  </div>
                  <div className="font-['Noto_Sans_KR'] text-white/70 text-[16px]">
                    {selectedContent.type === '프로필용' ? '프로필 이미지' : 
                     selectedContent.type === '피드용' ? '피드 게시물' : 
                     '스토리 콘텐츠'}
                  </div>
                </div>
              </div>

              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-8 right-8 w-24 h-24 border-2 border-white rounded-full" />
                <div className="absolute bottom-8 left-8 w-20 h-20 border-2 border-white rounded-lg rotate-45" />
              </div>

              {/* Type Badge */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
                <span className="font-['Noto_Sans_KR'] text-[12px] text-white font-semibold">
                  {selectedContent.type}
                </span>
              </div>

              {/* Ratio Badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg z-10">
                <span className="font-['Noto_Sans_KR'] text-[12px] text-black font-semibold">
                  {selectedContent.ratio}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(selectedContent.id);
                }}
                className="flex-1 h-14 bg-white/10 backdrop-blur-sm rounded-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Heart 
                  className={`w-5 h-5 ${likedContents.has(selectedContent.id) ? 'fill-white text-white' : 'text-white'}`}
                />
                <span className="font-['Noto_Sans_KR'] text-white text-[14px] font-medium">
                  {likedContents.has(selectedContent.id) ? '북마크 취소' : '북마크'}
                </span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-14 bg-white/10 backdrop-blur-sm rounded-[16px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
                <span className="font-['Noto_Sans_KR'] text-white text-[14px] font-medium">
                  다운로드
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



