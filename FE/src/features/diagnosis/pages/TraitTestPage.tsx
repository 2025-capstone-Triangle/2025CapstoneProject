import { useState } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { BackButton } from '../../../shared/layout/BackButton';

interface TraitTestPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

const questions = [
  {
    id: 1,
    question: '새로운 사람들과 어울리는 것이 즐겁다',
    category: 'extrovert'
  },
  {
    id: 2,
    question: '계획적으로 일을 진행하는 편이다',
    category: 'organized'
  },
  {
    id: 3,
    question: '감정 표현을 자유롭게 하는 편이다',
    category: 'emotional'
  },
  {
    id: 4,
    question: '새로운 경험을 시도하는 것을 좋아한다',
    category: 'adventurous'
  },
  {
    id: 5,
    question: '논리적으로 생각하고 결정하는 편이다',
    category: 'logical'
  }
];

export function TraitTestPage({ onNext, onBack, onHome }: TraitTestPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (score: number) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: score });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => onNext?.(), 300);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="mx-auto max-w-[760px] px-8 pt-8">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              질문 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="font-['Noto_Sans_KR'] text-[14px] text-black font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-12">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black leading-[1.3]">
            {questions[currentQuestion].question}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 pb-8">
          {[
            { label: '전혀 아니다', score: 1 },
            { label: '아니다', score: 2 },
            { label: '보통이다', score: 3 },
            { label: '그렇다', score: 4 },
            { label: '매우 그렇다', score: 5 }
          ].map((option) => (
            <button
              key={option.score}
              onClick={() => handleAnswer(option.score)}
              className={`w-full bg-white border-2 rounded-[16px] h-[60px] font-['Noto_Sans_KR'] text-[15px] flex items-center justify-center transition-all ${
                answers[questions[currentQuestion].id] === option.score
                  ? 'border-black bg-black text-white'
                  : 'border-[#e5e5e5] text-black hover:border-[#c0c0c0]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}




