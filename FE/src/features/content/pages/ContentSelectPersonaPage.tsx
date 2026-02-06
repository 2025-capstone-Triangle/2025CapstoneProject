import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { Check } from 'lucide-react';

interface ContentSelectPersonaPageProps {
  onNext?: (personaId: string) => void;
  onBack?: () => void;
  onHome?: () => void;
}

// 실제로는 저장된 페르소나를 가져와야 함
const savedPersonas = [
  {
    id: '1',
    name: '차분한 도시인',
    description: '세련되고 도시적인 미니멀리즘',
    colors: ['#000000', '#524A4A', '#808080', '#A69A91']
  },
  {
    id: '2',
    name: '열정적인 크리에이터',
    description: '창의적이고 자유로운 영혼',
    colors: ['#EF466F', '#FF6B8A', '#FFB4C6', '#FFF0F3']
  },
  {
    id: '3',
    name: '프로페셔널 리더',
    description: '논리적이고 체계적인 전문가',
    colors: ['#1a4d8f', '#2563a8', '#60a5fa', '#dbeafe']
  }
];

export function ContentSelectPersonaPage({ onNext, onBack, onHome }: ContentSelectPersonaPageProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>('1');

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-2 leading-tight">
            페르소나 선택
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            콘텐츠에 사용할 페르소나를 선택해주세요
          </p>
        </div>

        {/* Persona Cards */}
        <div className="space-y-3 mb-6">
          {savedPersonas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={`w-full rounded-[16px] p-5 flex items-center gap-4 transition-all ${
                selectedPersona === persona.id
                  ? 'bg-black'
                  : 'bg-[#f8f8f8] hover:bg-[#f0f0f0]'
              }`}
            >
              {/* Profile Image */}
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[12px] flex-shrink-0" />

              {/* Info */}
              <div className="flex-1 text-left">
                <h3 className={`font-['NEXON_Football_Gothic'] font-bold text-[18px] mb-1 ${
                  selectedPersona === persona.id ? 'text-white' : 'text-black'
                }`}>
                  {persona.name}
                </h3>
                <p className={`font-['Noto_Sans_KR'] text-[13px] mb-3 ${
                  selectedPersona === persona.id ? 'text-white/80' : 'text-[#6b6b6b]'
                }`}>
                  {persona.description}
                </p>
                
                {/* Color Palette */}
                <div className="flex gap-1.5">
                  {persona.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`w-5 h-5 rounded-full shadow-sm ${
                        selectedPersona === persona.id ? 'border border-white/30' : 'border border-white'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedPersona === persona.id ? (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <Check className="w-5 h-5 text-black" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#c0c0c0] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <button
          onClick={() => selectedPersona && onNext?.(selectedPersona)}
          disabled={!selectedPersona}
          className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm disabled:opacity-50 hover:bg-[#1a1a1a] transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}


