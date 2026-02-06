import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { Heart, ChevronDown, RefreshCw, Sparkles, RotateCcw } from 'lucide-react';

interface DiagnosisResultPageProps {
  onSave?: () => void;
  onRecreate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function DiagnosisResultPage({ onSave, onRecreate, onBack, onHome }: DiagnosisResultPageProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const colors = ['#000000', '#524A4A', '#808080', '#A69A91'];

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      {/* Hero Section */}
      <div className="relative px-8 pt-8 pb-8">
        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] text-white px-5 py-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="font-['Noto_Sans_KR'] font-semibold text-[13px]">페르소나 생성 완료</span>
          </div>
        </div>

        {/* Main Profile Image */}
        <div className="relative mb-6">
          <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white" />
          
          {/* Like Button */}
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart 
              className={`w-6 h-6 transition-all ${liked ? 'fill-[#EF466F] text-[#EF466F]' : 'text-black'}`}
            />
          </button>

          {/* Image Navigation */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentImageIndex === index 
                    ? 'w-8 bg-white' 
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-t-[32px] px-8 pt-8 pb-32 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
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

        {/* Recommended Profile Photos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black flex items-center gap-2">
              <div className="w-1 h-5 bg-black rounded-full" />
              추천 프로필
            </h3>
            <button className="p-2 hover:bg-[#f0f0f0] rounded-full transition-colors">
              <RefreshCw className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-square bg-gradient-to-br from-[#e8e8e8] via-[#d0d0d0] to-[#c0c0c0] rounded-[16px] shadow-md" />
            <div className="aspect-square bg-gradient-to-br from-[#e0e0e0] via-[#c8c8c8] to-[#b8b8b8] rounded-[16px] shadow-md" />
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onRecreate}
            className="flex-1 bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-black flex items-center justify-center gap-2 hover:border-black hover:bg-[#fafafa] transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            새로 만들기
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-black to-[#2d2d2d] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}


