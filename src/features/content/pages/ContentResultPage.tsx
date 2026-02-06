import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { Download, RefreshCw, X, ChevronLeft, BookmarkPlus, Home, User } from 'lucide-react';

interface ContentResultPageProps {
  ratio: string;
  onSave?: () => void;
  onRegenerate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onViewPersona?: () => void;
}

const generatedImages = [
  { 
    id: 1, 
    liked: false,
    bookmarked: false,
    description: '도시의 밤 풍경을 배경으로 차분하고 세련된 분위기를 연출한 사진입니다.',
    isGenerating: false
  },
  { 
    id: 2, 
    liked: false,
    bookmarked: false,
    description: '미니멀한 공간에서 포착한 모던하고 깔끔한 느낌의 프로필 사진입니다.',
    isGenerating: false
  },
  { 
    id: 3, 
    liked: false,
    bookmarked: false,
    description: '자연광을 활용해 차분하면서도 따뜻한 감성을 담은 사진입니다.',
    isGenerating: false
  },
  { 
    id: 4, 
    liked: false,
    bookmarked: false,
    description: '도시적인 배경과 함께 세련되고 전문적인 이미지를 표현한 사진입니다.',
    isGenerating: false
  }
];

const getRatioConfig = (ratio?: string) => {
  switch (ratio) {
    case '1:1':
      return { title: '생성된 프로필용 사진', subtitle: '1:1 비율 · 프로필용', aspect: 'aspect-square' };
    case '4:5':
      return { title: '생성된 피드용 사진', subtitle: '4:5 비율 · 피드용', aspect: 'aspect-[4/5]' };
    case '9:16':
      return { title: '생성된 스토리용 사진', subtitle: '9:16 비율 · 스토리용', aspect: 'aspect-[9/16]' };
    default:
      return { title: '생성된 사진', subtitle: '피드용', aspect: 'aspect-[4/5]' };
  }
};

export function ContentResultPage({ ratio, onSave, onRegenerate, onBack, onHome, onViewPersona }: ContentResultPageProps) {
  const [bookmarkedImages, setBookmarkedImages] = useState<Set<number>>(new Set());
  const [viewingImage, setViewingImage] = useState<number | null>(null);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<number>>(new Set());

  const ratioInfo = getRatioConfig(ratio);

  const toggleBookmark = (id: number) => {
    const newBookmarked = new Set(bookmarkedImages);
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id);
    } else {
      newBookmarked.add(id);
    }
    setBookmarkedImages(newBookmarked);
  };

  const handleDownload = (id: number) => {
    console.log('Download image:', id);
    // 실제 다운로드 로직
  };

  const handleRegenerateImage = (id: number) => {
    setRegeneratingImages(prev => new Set(prev).add(id));
    
    // 2초 후 재생성 완료 시뮬레이션
    setTimeout(() => {
      setRegeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto flex flex-col">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      
      {/* Back Button */}
      <div className="px-8 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#6b6b6b] hover:text-black transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-['Noto_Sans_KR'] text-[14px] font-medium">뒤로가기</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Header with Persona Info */}
        <div className="mb-6 bg-white rounded-[20px] p-5 shadow-sm border border-[#f0f0f0]">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#2d2d2d] to-[#1d1d1d] rounded-[12px] flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black mb-2">
                차분한 도시인
              </h2>
              <div className="flex gap-1.5">
                {['#000000', '#524A4A', '#808080', '#A69A91'].map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[22px] text-black mb-1">
            {ratioInfo.title}
          </h3>
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
            {ratioInfo.subtitle} · 총 4개 생성됨
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {generatedImages.map((image) => (
            <div key={image.id} className="group">
              {/* Image Card */}
              <button
                onClick={() => setViewingImage(image.id)}
                className={`w-full ${ratioInfo.aspect} bg-gradient-to-br from-[#e8e8e8] via-[#d8d8d8] to-[#c8c8c8] rounded-[20px] overflow-hidden transition-all shadow-md hover:shadow-xl mb-3 relative`}
              >
                {/* Regenerating Spinner */}
                {regeneratingImages.has(image.id) && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-black animate-spin" />
                      <p className="font-['Noto_Sans_KR'] text-[12px] text-black font-medium">
                        생성 중...
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>

              {/* Actions - 3 buttons in a row */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateImage(image.id);
                  }}
                  disabled={regeneratingImages.has(image.id)}
                  className={`h-[44px] rounded-[12px] flex items-center justify-center transition-all ${
                    regeneratingImages.has(image.id)
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-white border border-[#e5e5e5] hover:border-black'
                  }`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${
                      regeneratingImages.has(image.id)
                        ? 'text-[#c0c0c0] animate-spin'
                        : 'text-[#6b6b6b]'
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(image.id);
                  }}
                  className={`h-[44px] rounded-[12px] flex items-center justify-center transition-all ${
                    bookmarkedImages.has(image.id)
                      ? 'bg-black shadow-md'
                      : 'bg-white border border-[#e5e5e5] hover:border-black'
                  }`}
                >
                  <BookmarkPlus
                    className={`w-5 h-5 transition-all ${
                      bookmarkedImages.has(image.id)
                        ? 'text-white'
                        : 'text-[#6b6b6b]'
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image.id);
                  }}
                  className="h-[44px] bg-white border border-[#e5e5e5] rounded-[12px] flex items-center justify-center hover:border-black transition-all"
                >
                  <Download className="w-5 h-5 text-[#6b6b6b]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewPersona}
              className="h-[52px] bg-white border-2 border-black rounded-[16px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] font-semibold text-black hover:bg-[#fafafa] transition-all shadow-sm"
            >
              <User className="w-5 h-5" />
              페르소나 보기
            </button>
            <button
              onClick={onHome}
              className="h-[52px] bg-white border-2 border-[#e5e5e5] rounded-[16px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] font-semibold text-black hover:border-black transition-all shadow-sm"
            >
              <Home className="w-5 h-5" />
              홈으로
            </button>
          </div>
          <button
            onClick={onRegenerate}
            className="w-full h-[56px] bg-black hover:bg-[#1a1a1a] rounded-[16px] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[15px] font-semibold text-white transition-all shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            다른 비율로 다시 생성하기
          </button>
        </div>

        {/* Info Text */}
        <div className="bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] rounded-[16px] p-5 border border-[#e5e5e5]">
          <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b] leading-[1.7] text-center">
            북마크한 콘텐츠만<br />
            페르소나에 저장됩니다
          </p>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="max-w-[390px] w-full">
            {/* Close Button */}
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>

            {/* Large Image */}
            <div className={`w-full ${ratioInfo.aspect} bg-gradient-to-br from-[#e8e8e8] via-[#d8d8d8] to-[#c8c8c8] rounded-[24px] overflow-hidden shadow-2xl mb-6`} />

            {/* Modal Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRegenerateImage(viewingImage)}
                  disabled={regeneratingImages.has(viewingImage)}
                  className={`h-[56px] rounded-[16px] flex flex-col items-center justify-center gap-1 font-['Noto_Sans_KR'] text-[13px] font-semibold transition-all ${
                    regeneratingImages.has(viewingImage)
                      ? 'bg-white/5 backdrop-blur-md text-white/50 cursor-not-allowed'
                      : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 ${regeneratingImages.has(viewingImage) ? 'animate-spin' : ''}`} />
                  다시생성
                </button>
                <button
                  onClick={() => toggleBookmark(viewingImage)}
                  className={`h-[56px] rounded-[16px] flex flex-col items-center justify-center gap-1 font-['Noto_Sans_KR'] text-[13px] font-semibold transition-all ${
                    bookmarkedImages.has(viewingImage)
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
                  }`}
                >
                  <BookmarkPlus className="w-5 h-5" />
                  북마크
                </button>
                <button
                  onClick={() => handleDownload(viewingImage)}
                  className="h-[56px] bg-white/10 backdrop-blur-md rounded-[16px] flex flex-col items-center justify-center gap-1 font-['Noto_Sans_KR'] text-[13px] font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <Download className="w-5 h-5" />
                  저장
                </button>
              </div>
              
              {/* Description in Modal */}
              <div className="bg-white/10 backdrop-blur-md rounded-[16px] p-5">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-white/90 leading-[1.7] text-center">
                  {generatedImages.find(img => img.id === viewingImage)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


