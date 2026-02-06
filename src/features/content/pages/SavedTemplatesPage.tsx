import { ChevronLeft, Heart } from 'lucide-react';
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback';
import { useState, useEffect } from 'react';
import imgImage55 from "figma:asset/ac4448f9289ba74dc8e260cf2469fe907263ed9b.png";
import imgImage56 from "figma:asset/265cd7ba4de44d517944d6e28fbe7a516c2c8937.png";
import imgImage84 from "figma:asset/761f46596218a649ae167df03599465380531f96.png";

interface SavedTemplatesPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

interface ContentTemplate {
  id: string;
  image: string;
  title: string;
  height: 'short' | 'medium' | 'tall';
}

// All available templates
const allTemplates: { [key: string]: ContentTemplate } = {
  hanbok: {
    id: 'hanbok',
    image: 'https://images.unsplash.com/photo-1544032659-d12c28f0a38a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '한복 화보',
    height: 'tall'
  },
  turtleneck: {
    id: 'turtleneck',
    image: imgImage55,
    title: '터틀넥 룩북',
    height: 'medium'
  },
  'evening-dress': {
    id: 'evening-dress',
    image: 'https://images.unsplash.com/photo-1763336016192-c7b62602e993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '이브닝 드레스',
    height: 'tall'
  },
  'street-style': {
    id: 'street-style',
    image: 'https://images.unsplash.com/photo-1654507517159-5dcd62622b93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '스트릿 캐주얼',
    height: 'short'
  },
  dress: {
    id: 'dress',
    image: imgImage56,
    title: '원피스 코디',
    height: 'medium'
  },
  'business-suit': {
    id: 'business-suit',
    image: 'https://images.unsplash.com/photo-1425421669292-0c3da3b8f529?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '비즈니스 수트',
    height: 'short'
  },
  bohemian: {
    id: 'bohemian',
    image: 'https://images.unsplash.com/photo-1758887261967-d978ce32ee04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '보헤미안 스타일',
    height: 'tall'
  },
  minimal: {
    id: 'minimal',
    image: 'https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '미니멀 룩',
    height: 'medium'
  },
  sportswear: {
    id: 'sportswear',
    image: imgImage84,
    title: '스포츠웨어',
    height: 'short'
  },
  beach: {
    id: 'beach',
    image: 'https://images.unsplash.com/photo-1718839932460-5c51922303df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '여름 비치웨어',
    height: 'tall'
  },
  autumn: {
    id: 'autumn',
    image: 'https://images.unsplash.com/photo-1728898868297-b53e09a954c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '가을 니트',
    height: 'medium'
  },
  luxury: {
    id: 'luxury',
    image: 'https://images.unsplash.com/photo-1768885560973-454bc193824d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '럭셔리 스타일',
    height: 'short'
  },
  streetwear: {
    id: 'streetwear',
    image: 'https://images.unsplash.com/photo-1635650804483-2a77a8c9e728?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '어반 스트릿',
    height: 'tall'
  },
  vintage: {
    id: 'vintage',
    image: 'https://images.unsplash.com/photo-1622032209098-b34bd5fb1776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '빈티지 레트로',
    height: 'medium'
  },
  spring: {
    id: 'spring',
    image: 'https://images.unsplash.com/photo-1762342018061-9f52623dbc94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '봄 플로럴',
    height: 'tall'
  }
};

function SavedTopBar({ onBack, count }: { onBack?: () => void; count: number }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="h-[56px] flex items-center justify-between px-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black">
            저장된 템플릿
          </h1>
          <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-500">
            {count}개
          </p>
        </div>
        <div className="w-9" />
      </div>
    </div>
  );
}

interface ContentCardProps {
  template: ContentTemplate;
  onClick?: () => void;
  onRemove?: () => void;
}

function ContentCard({ template, onClick, onRemove }: ContentCardProps) {
  const heightClasses = {
    short: 'h-[180px]',
    medium: 'h-[240px]',
    tall: 'h-[300px]'
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className={`relative ${heightClasses[template.height]} rounded-xl overflow-hidden bg-gray-100`}>
        {template.image.startsWith('http') ? (
          <ImageWithFallback
            src={template.image}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <img
            src={template.image}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-['NEXON_Football_Gothic'] text-[14px] text-white font-bold">
            {template.title}
          </h3>
        </div>

        <button
          onClick={handleRemoveClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
        >
          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onExplore }: { onExplore?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Heart className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black mb-2">
        저장된 템플릿이 없어요
      </h3>
      <p className="font-['Noto_Sans_KR'] text-[14px] text-gray-500 text-center mb-6">
        마음에 드는 템플릿을 저장하고<br />나중에 다시 찾아보세요
      </p>
      <button
        onClick={onExplore}
        className="px-6 py-3 bg-black text-white rounded-full font-['NEXON_Football_Gothic'] font-bold text-[14px] hover:bg-gray-800 transition-colors"
      >
        템플릿 둘러보기
      </button>
    </div>
  );
}

export function SavedTemplatesPage({ onBack, onNavigate }: SavedTemplatesPageProps) {
  const [savedTemplates, setSavedTemplates] = useState<ContentTemplate[]>([]);

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = () => {
    const saved = localStorage.getItem('savedTemplates');
    if (saved) {
      const templateIds: string[] = JSON.parse(saved);
      const templates = templateIds
        .map(id => allTemplates[id])
        .filter(Boolean);
      setSavedTemplates(templates);
    }
  };

  const handleRemoveTemplate = (templateId: string) => {
    const saved = localStorage.getItem('savedTemplates');
    if (saved) {
      const templateIds: string[] = JSON.parse(saved);
      const updatedIds = templateIds.filter(id => id !== templateId);
      localStorage.setItem('savedTemplates', JSON.stringify(updatedIds));
      loadSavedTemplates();
    }
  };

  const handleTemplateClick = (templateId: string) => {
    onNavigate?.('content-aspect-ratio');
  };

  // Distribute items into two columns
  const leftColumn: ContentTemplate[] = [];
  const rightColumn: ContentTemplate[] = [];
  
  savedTemplates.forEach((template, index) => {
    if (index % 2 === 0) {
      leftColumn.push(template);
    } else {
      rightColumn.push(template);
    }
  });

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      <SavedTopBar onBack={onBack} count={savedTemplates.length} />
      
      {savedTemplates.length === 0 ? (
        <EmptyState onExplore={() => onNavigate?.('content-explore')} />
      ) : (
        <div className="px-3 py-3">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-3">
              {leftColumn.map((template) => (
                <ContentCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                  onRemove={() => handleRemoveTemplate(template.id)}
                />
              ))}
            </div>
            
            <div className="flex-1 flex flex-col gap-3">
              {rightColumn.map((template) => (
                <ContentCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                  onRemove={() => handleRemoveTemplate(template.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



