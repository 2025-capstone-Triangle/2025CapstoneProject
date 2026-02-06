import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';
import { ChevronRight } from 'lucide-react';

interface PreferenceTestPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

// 7가지 질문 구조
const questions = [
  {
    id: 1,
    title: '현실감의 정도',
    question: '어떤 톤의 이미지를 볼 때 더 몰입되나요?',
    type: 'text' as const,
    options: [
      { id: 'A', label: '자연광 (외부/일상)', desc: '셀카, 풍경 사진, 비전문가 느낌' },
      { id: 'B', label: '외부/연출', desc: '자연광이지만 연출된 느낌' },
      { id: 'C', label: '실제 생활 공간 (실내/일상)', desc: '집, 카페 등 일상 공간' },
      { id: 'D', label: '스튜디오 조명 (실내/연출)', desc: '증명사진, 웨딩사진, 전문가 느낌' }
    ]
  },
  {
    id: 2,
    title: '이미지의 밀도',
    question: '시선이 머무는 이미지는 어떤 스타일인가요?',
    type: 'image' as const,
    options: [
      { id: 'A', label: '정돈된 미니멀리즘', desc: '여백이 많고 핵심 피사체만 강조' },
      { id: 'B', label: '꽉 찬 맥시멀리즘', desc: '소품이 많고 정보량이 풍부함' }
    ]
  },
  {
    id: 3,
    title: '시간대와 광원',
    question: '본인의 취향을 한 단어로 표현한다면?',
    type: 'text' as const,
    options: [
      { id: 'A', label: '화사하고 맑은', desc: '낮, 햇살, 밝고 긍정적인 에너지' },
      { id: 'B', label: '차분하고 깊이 있는', desc: 'Sunset, 밤, 그림자가 짙은 분위기' }
    ]
  },
  {
    id: 4,
    title: '대비감',
    question: '피사체와 배경의 대비는 어떤 것이 좋나요?',
    type: 'text' as const,
    options: [
      { id: 'A', label: '강한 대비', desc: '피사체가 명확히 두드러지는' },
      { id: 'B', label: '부드러운 대비', desc: '피사체와 배경이 자연스럽게 어우러지는' }
    ]
  },
  {
    id: 5,
    title: '이미지의 생동감',
    question: '사진에서 어떤 분위기가 느껴지길 원하시나요?',
    type: 'text' as const,
    options: [
      { id: 'A', label: '멈춰있는 고요함', desc: '정면 응시, 정적인 포즈, 안정감' },
      { id: 'B', label: '움직이는 생동감', desc: '걷는 모습, 흩날림, 현장감' }
    ]
  },
  {
    id: 6,
    title: '색감 선호',
    question: '어떤 계열의 색감이 좋으신가요?',
    type: 'color' as const,
    options: [
      { id: 'A', label: '웜톤', desc: '따뜻한 느낌' },
      { id: 'B', label: '뉴트럴', desc: '중립적인 느낌' },
      { id: 'C', label: '쿨톤', desc: '시원한 느낌' }
    ]
  },
  {
    id: 7,
    title: '사진 비율',
    question: '어떤 구도의 이미지가 더 마음에 드나요?',
    type: 'ratio' as const,
    options: [
      { id: 'A', label: '클로즈업', desc: '얼굴 위주' },
      { id: 'B', label: '흉상', desc: '상반신' },
      { id: 'C', label: '반신', desc: '허리까지' },
      { id: 'D', label: '전신', desc: '발끝까지' },
      { id: 'E', label: '풀샷', desc: '여백 있는 전신' }
    ]
  }
];

export function PreferenceTestPage({ onNext, onBack, onHome }: PreferenceTestPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSubQuestion, setShowSubQuestion] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answerId: string) => {
    const newAnswers = { ...answers, [question.id]: answerId };
    setAnswers(newAnswers);

    // 색감 질문(6번)이면 서브 질문으로 이동
    if (question.id === 6 && !showSubQuestion) {
      setShowSubQuestion(true);
    } else {
      // 다음 질문으로
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setShowSubQuestion(false);
        } else {
          onNext?.();
        }
      }, 300);
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="px-8">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
              {currentQuestion + 1} / {questions.length}
            </span>
            <span className="font-['Noto_Sans_KR'] text-[14px] text-black font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-3">
            <span className="inline-block bg-black text-white px-3 py-1.5 rounded-full font-['Noto_Sans_KR'] text-[12px] font-semibold mb-3">
              {question.title}
            </span>
          </div>
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[24px] text-black leading-tight mb-2">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        {!showSubQuestion ? (
          <div className="space-y-3 pb-8">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full text-left p-5 rounded-[16px] border-2 transition-all ${
                  answers[question.id] === option.id
                    ? 'border-black bg-[#fafafa] shadow-md'
                    : 'border-[#e5e5e5] bg-white hover:border-[#d0d0d0] hover:bg-[#fafafa]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-['NEXON_Football_Gothic'] text-[16px] font-bold text-black mb-1">
                      {option.label}
                    </div>
                    <div className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] leading-relaxed">
                      {option.desc}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    answers[question.id] === option.id
                      ? 'border-black bg-black'
                      : 'border-[#d0d0d0]'
                  }`}>
                    {answers[question.id] === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // 색감 서브 질문 (채도)
          <div className="space-y-3 pb-8">
            <div className="mb-6">
              <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[20px] text-black mb-4">
                채도는 어느 정도가 좋을까요?
              </h3>
            </div>
            
            {[
              { id: 'high-bright', label: '선명하고 밝게', desc: '고채도 · 고명도' },
              { id: 'high-dark', label: '선명하고 진하게', desc: '고채도 · 저명도' },
              { id: 'low-bright', label: '차분하고 밝게', desc: '저채도 · 고명도' },
              { id: 'low-dark', label: '차분하고 깊게', desc: '저채도 · 저명도' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className="w-full text-left p-5 rounded-[16px] border-2 border-[#e5e5e5] bg-white hover:border-black hover:bg-[#fafafa] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-['NEXON_Football_Gothic'] text-[16px] font-bold text-black mb-1">
                      {option.label}
                    </div>
                    <div className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                      {option.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6b6b6b]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



