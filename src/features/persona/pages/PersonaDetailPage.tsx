import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { Heart, Download, Sparkles, Edit2, Trash2, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PersonaDetailPageProps {
  onDelete?: () => void;
  onCreateContent?: () => void;
  onBack?: () => void;
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
  onHome?: () => void;
  onViewAllContents?: () => void;
}

const savedContents = [
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
];

export function PersonaDetailPage({ onDelete, onCreateContent, onBack, onTabChange, onHome, onViewAllContents }: PersonaDetailPageProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [likedContents, setLikedContents] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [personaName, setPersonaName] = useState('차분한 도시인');
  const [editingName, setEditingName] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const colors = ['#000000', '#524A4A', '#808080', '#A69A91'];

  const toggleLike = (id: number) => {
    const newLiked = new Set(likedContents);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedContents(newLiked);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    onDelete?.();
  };

  const handleEditNameClick = () => {
    setEditingName(personaName);
    setShowEditNameModal(true);
  };

  const saveEditedName = () => {
    if (editingName.trim()) {
      setPersonaName(editingName.trim());
    }
    setShowEditNameModal(false);
  };

  // Show only first 3 contents
  const recentContents = savedContents.slice(0, 3);

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto pb-[80px]">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section - Main Profile Image */}
        <div className="relative px-8 pt-6 pb-6">
          <div className="relative mb-6">
            <div className="w-full aspect-square max-w-[200px] mx-auto bg-gradient-to-br from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d] rounded-[24px] overflow-hidden shadow-2xl" />
            
            {/* Image Navigation Dots */}
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentImageIndex === index 
                      ? 'w-8 bg-black' 
                      : 'w-1.5 bg-[#d0d0d0]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name with Edit Icon */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black leading-tight">
                {personaName}
              </h1>
              <button
                onClick={handleEditNameClick}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4.5 h-4.5 text-[#6b6b6b]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-t-[32px] px-8 pt-8 pb-8 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          {/* Keywords */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {['차분한', '세련된', '도시적'].map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] px-4 py-2 rounded-full font-['NEXON_Football_Gothic'] text-[16px] text-black border border-[#e5e5e5]"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="mb-8">
            <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-black rounded-full" />
              컬러 팔레트
            </h3>
            <div className="bg-[#fafafa] rounded-[16px] p-5 flex items-center justify-around">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`rounded-full transition-all shadow-md ${
                    selectedColor === index
                      ? 'w-[48px] h-[48px] ring-4 ring-offset-4 ring-black/20'
                      : 'w-[40px] h-[40px] hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-black rounded-full" />
              페르소나 설명
            </h3>
            <div className="bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-[16px] p-5 border border-[#e5e5e5]">
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#262626] leading-[1.8]">
                차분하고 절제된 음성과 내향적인 완벽주의 성향,
                세련되고 도시적인 미니멀리즘을 추구합니다.
              </p>
            </div>
          </div>

          {/* Details Dropdown */}
          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-4 px-5 border-2 border-[#f0f0f0] rounded-[16px] hover:border-[#e5e5e5] transition-colors"
            >
              <span className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black">
                상세 정보
              </span>
              <ChevronDown className={`w-5 h-5 text-[#6b6b6b] transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            {showDetails && (
              <div className="bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] rounded-[16px] p-5 mt-3 border border-[#e5e5e5]">
                <p className="font-['Noto_Sans_KR'] text-[14px] text-[#262626] leading-[1.8]">
                  차분하고 내성적인 성향으로 깊이 있는 사고를 선호합니다. 
                  세련된 미니멀리즘을 추구하며, 모던하고 도시적인 이미지를 갖고 있습니다.
                  완벽주의 성향이 있어 디테일에 신경을 많이 씁니다.
                </p>
              </div>
            )}
          </div>

          {/* Create Content Button */}
          <button
            onClick={onCreateContent}
            className="w-full bg-gradient-to-r from-black to-[#2d2d2d] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all mb-8"
          >
            <Sparkles className="w-5 h-5" />
            이 페르소나로 콘텐츠 만들기
          </button>

          {/* Saved Contents Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black flex items-center gap-2">
                <div className="w-1 h-5 bg-black rounded-full" />
                저장된 콘텐츠
              </h3>
              <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                {savedContents.length}개
              </span>
            </div>

            {/* Content Grid - Only first 3 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {recentContents.map((content) => (
                <div
                  key={content.id}
                  className="flex-shrink-0 cursor-pointer group"
                >
                  {/* Image - Fixed Height */}
                  <div className={`w-full h-[140px] bg-gradient-to-br ${content.gradient} rounded-[16px] overflow-hidden shadow-sm group-hover:shadow-lg transition-all relative`}>
                    {/* Type Badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-md z-10">
                      <span className="font-['Noto_Sans_KR'] text-[9px] text-white font-semibold">
                        {content.type}
                      </span>
                    </div>

                    {/* Ratio Badge - Bottom Left */}
                    <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md z-10">
                      <span className="font-['Noto_Sans_KR'] text-[9px] text-black font-semibold">
                        {content.ratio}
                      </span>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(content.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 active:scale-95 duration-200 z-10"
                    >
                      <Heart 
                        className={`w-4 h-4 ${likedContents.has(content.id) ? 'fill-black text-black' : 'text-black'}`}
                      />
                    </button>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            {savedContents.length > 3 && (
              <button
                onClick={onViewAllContents}
                className="w-full bg-[#f8f8f8] hover:bg-[#f0f0f0] rounded-[12px] h-[44px] flex items-center justify-center gap-2 transition-colors"
              >
                <span className="font-['Noto_Sans_KR'] font-medium text-[14px] text-black">
                  전체 콘텐츠 보기
                </span>
                <ChevronRight className="w-4 h-4 text-[#6b6b6b]" />
              </button>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="w-full bg-[#fff5f5] hover:bg-[#ffe5e5] border border-[#ffd0d0] rounded-[12px] h-[48px] flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4.5 h-4.5 text-[#EF466F]" />
            <span className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-[#EF466F]">
              페르소나 삭제
            </span>
          </button>
        </div>
      </div>

      {/* Edit Name Modal */}
      {showEditNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[24px] p-8 max-w-[320px] w-full">
            <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[20px] text-black mb-4 text-center">
              페르소나 이름 변경
            </h3>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full bg-[#f8f8f8] rounded-[12px] h-[48px] px-4 font-['Noto_Sans_KR'] text-[15px] text-black mb-6 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="페르소나 이름"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditNameModal(false)}
                className="flex-1 bg-[#f0f0f0] rounded-[14px] h-[48px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-black hover:bg-[#e5e5e5] transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveEditedName}
                className="flex-1 bg-black rounded-[14px] h-[48px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white hover:bg-[#2d2d2d] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[24px] p-8 max-w-[320px] w-full">
            <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[20px] text-black mb-3 text-center">
              페르소나 삭제
            </h3>
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] mb-6 text-center leading-[1.6]">
              이 페르소나를 삭제하시겠습니까?<br />
              삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-[#f0f0f0] rounded-[14px] h-[48px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-black hover:bg-[#e5e5e5] transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-[#EF466F] rounded-[14px] h-[48px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white hover:bg-[#d63d62] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


