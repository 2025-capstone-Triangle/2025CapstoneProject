import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { Plus, ChevronRight, Heart, GripVertical } from 'lucide-react';

interface PersonaListPageProps {
  onPersonaClick?: (id: string) => void;
  onCreateNew?: () => void;
  onTabChange?: (tab: 'home' | 'persona' | 'content') => void;
  onBack?: () => void;
  onHome?: () => void;
}

interface Persona {
  id: string;
  name: string;
  description: string;
  colors: string[];
  isFavorite: boolean;
}

const initialPersonas: Persona[] = [
  {
    id: '1',
    name: '차분한 도시인',
    description: '세련되고 도시적인 미니멀리즘',
    colors: ['#000000', '#524A4A', '#808080', '#A69A91'],
    isFavorite: true
  },
  {
    id: '2',
    name: '열정적인 크리에이터',
    description: '창의적이고 자유로운 영혼',
    colors: ['#EF466F', '#FF6B8A', '#FFB4C6', '#FFF0F3'],
    isFavorite: false
  },
  {
    id: '3',
    name: '프로페셔널 리더',
    description: '논리적이고 체계적인 전문가',
    colors: ['#1a4d8f', '#2563a8', '#60a5fa', '#dbeafe'],
    isFavorite: false
  }
];

export function PersonaListPage({ onPersonaClick, onCreateNew, onTabChange, onBack, onHome }: PersonaListPageProps) {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPersonas(personas.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPersonas = [...sortedPersonas];
    const draggedItem = newPersonas[draggedIndex];
    
    newPersonas.splice(draggedIndex, 1);
    newPersonas.splice(index, 0, draggedItem);
    
    setPersonas(newPersonas);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Sort: favorites first, then by current order
  const sortedPersonas = [...personas].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  const favoriteCount = personas.filter(p => p.isFavorite).length;

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto pb-[80px]">      <DefaultTopBar title="My Persona" onTitleClick={onHome} />
      <BackButton onClick={onBack} />
      
      <div className="px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-2 leading-tight">
            저장된 페르소나
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            총 {personas.length}개의 페르소나 {favoriteCount > 0 && `· ❤️ ${favoriteCount}개`}
          </p>
        </div>

        {/* Persona Cards */}
        <div className="space-y-3 mb-6">
          {sortedPersonas.map((persona, index) => (
            <div
              key={persona.id}
              className={`relative bg-[#f8f8f8] rounded-[16px] transition-all group hover:bg-[#f0f0f0] ${
                draggedIndex === index ? 'opacity-50 scale-95' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <button
                onClick={() => onPersonaClick?.(persona.id)}
                className="w-full flex items-center gap-4 p-5"
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-move touch-none" onClickCapture={(e) => e.stopPropagation()}>
                  <GripVertical className="w-5 h-5 text-[#c0c0c0] group-hover:text-[#6b6b6b] transition-colors" />
                </div>

                {/* Profile Image */}
                <div className="w-[70px] h-[70px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[12px] flex-shrink-0" />

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black mb-1">
                    {persona.name}
                  </h3>
                  <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] mb-3">
                    {persona.description}
                  </p>
                  
                  {/* Color Palette */}
                  <div className="flex gap-1.5">
                    {persona.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="w-5 h-5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Favorite Button */}
                <div
                  onClick={(e) => toggleFavorite(persona.id, e)}
                  className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      persona.isFavorite 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-[#d0d0d0]'
                    } transition-colors`}
                  />
                </div>

                {/* Arrow Icon */}
                <ChevronRight className="w-5 h-5 text-[#c0c0c0] group-hover:text-black transition-colors flex-shrink-0" />
              </button>
            </div>
          ))}
        </div>

        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="w-full border-2 border-dashed border-[#d0d0d0] rounded-[16px] h-[100px] flex items-center justify-center gap-3 hover:border-black hover:bg-[#fafafa] transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#6b6b6b]" strokeWidth={2.5} />
          </div>
          <span className="font-['Noto_Sans_KR'] font-medium text-[14px] text-[#6b6b6b]">
            새 페르소나 만들기
          </span>
        </button>
      </div>
    </div>
  );
}


