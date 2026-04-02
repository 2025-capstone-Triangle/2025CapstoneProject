import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import {
  savePreferenceTestResult,
  type PreferenceImageSelection,
  type PreferenceToneAdjustment,
} from "../lib/preferenceTest";
import trait11 from "../../../assets/traitTest/1-1.png";
import trait12 from "../../../assets/traitTest/1-2.png";
import trait13 from "../../../assets/traitTest/1-3.png";
import trait14 from "../../../assets/traitTest/1-4.png";
import trait21 from "../../../assets/traitTest/2-1.png";
import trait22 from "../../../assets/traitTest/2-2.png";
import trait31 from "../../../assets/traitTest/3-1.png";
import trait32 from "../../../assets/traitTest/3-2.png";
import trait41 from "../../../assets/traitTest/4-1.png";
import trait42 from "../../../assets/traitTest/4-2.png";
import trait51 from "../../../assets/traitTest/5-1.png";
import trait52 from "../../../assets/traitTest/5-2.png";
import trait61 from "../../../assets/traitTest/6-1.png";
import trait62 from "../../../assets/traitTest/6-2.png";
import trait63 from "../../../assets/traitTest/6-3.png";
import trait64 from "../../../assets/traitTest/6-4.png";
import trait65 from "../../../assets/traitTest/6-5.png";
import trait71 from "../../../assets/traitTest/7-1.png";

interface PreferenceTestPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

interface QuestionOption {
  id: string;
  src: string;
}

interface ImageQuestion {
  number: number;
  options: QuestionOption[];
}

const START_GUIDE = `다음으로 제시되는 이미지들 중

지금부터 여러 장의 이미지를 제시합니다.

각 문항에서 가장 마음에 드는 이미지 1장을 선택해 주세요.

처음 든 느낌대로 선택할수록 선호도가 더 정확하게 반영됩니다.`;

const COMMON_QUESTION = "가장 마음에 드는 이미지를 선택해 주세요";

const IMAGE_QUESTIONS: ImageQuestion[] = [
  {
    number: 1,
    options: [
      { id: "1-1", src: trait11 },
      { id: "1-2", src: trait12 },
      { id: "1-3", src: trait13 },
      { id: "1-4", src: trait14 },
    ],
  },
  {
    number: 2,
    options: [
      { id: "2-1", src: trait21 },
      { id: "2-2", src: trait22 },
    ],
  },
  {
    number: 3,
    options: [
      { id: "3-1", src: trait31 },
      { id: "3-2", src: trait32 },
    ],
  },
  {
    number: 4,
    options: [
      { id: "4-1", src: trait41 },
      { id: "4-2", src: trait42 },
    ],
  },
  {
    number: 5,
    options: [
      { id: "5-1", src: trait51 },
      { id: "5-2", src: trait52 },
    ],
  },
  {
    number: 6,
    options: [
      { id: "6-1", src: trait61 },
      { id: "6-2", src: trait62 },
      { id: "6-3", src: trait63 },
      { id: "6-4", src: trait64 },
      { id: "6-5", src: trait65 },
    ],
  },
];

const TOTAL_STEPS = 7;
const DEFAULT_TONE: PreferenceToneAdjustment = {
  saturation: 50,
  brightness: 50,
  contrast: 50,
  temperature: 50,
};

function SliderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{label}</p>
        <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">{value}</p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-black"
      />
    </div>
  );
}

function getOptionGridClass(optionCount: number) {
  if (optionCount <= 2) return "grid-cols-1 sm:grid-cols-2";
  if (optionCount === 4) return "grid-cols-2 lg:grid-cols-4";
  if (optionCount >= 5) return "grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2";
}

export function PreferenceTestPage({ onNext, onBack, onHome }: PreferenceTestPageProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionByQuestion, setSelectedOptionByQuestion] = useState<Record<number, string>>({});
  const [toneAdjustment, setToneAdjustment] = useState<PreferenceToneAdjustment>(DEFAULT_TONE);

  const isToneStep = stepIndex === TOTAL_STEPS - 1;
  const currentQuestion = IMAGE_QUESTIONS[stepIndex];
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  const selectedCount = useMemo(
    () => Object.values(selectedOptionByQuestion).filter(Boolean).length,
    [selectedOptionByQuestion],
  );

  const imageFilterStyle = useMemo(() => {
    const saturation = Math.max(0, toneAdjustment.saturation / 50);
    const brightness = Math.max(0, toneAdjustment.brightness / 50);
    const contrast = Math.max(0, toneAdjustment.contrast / 50);

    return {
      filter: `saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`,
    };
  }, [toneAdjustment]);

  const temperatureOverlayStyle = useMemo(() => {
    const delta = toneAdjustment.temperature - 50;
    const isWarm = delta >= 0;
    const opacity = Math.min(Math.abs(delta) / 50, 1) * 0.28;

    return {
      backgroundColor: isWarm ? "#ffb46e" : "#7aa8ff",
      opacity,
    };
  }, [toneAdjustment.temperature]);

  const canGoNext = isToneStep || Boolean(selectedOptionByQuestion[currentQuestion?.number ?? -1]);

  const handleHeaderBack = () => {
    if (!hasStarted) {
      onBack?.();
      return;
    }

    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return;
    }

    setHasStarted(false);
  };

  const handleSelectOption = (questionNumber: number, optionId: string) => {
    setSelectedOptionByQuestion((prev) => ({ ...prev, [questionNumber]: optionId }));
  };

  const buildSelections = (): PreferenceImageSelection[] => {
    return IMAGE_QUESTIONS.map((question) => ({
      questionNumber: question.number,
      selectedOptionId: selectedOptionByQuestion[question.number],
      selectedImageKey: `traitTest/${selectedOptionByQuestion[question.number]}.png`,
    }));
  };

  const handleNextStep = () => {
    if (!canGoNext) return;

    if (!isToneStep) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    const imageSelections = buildSelections();
    savePreferenceTestResult({
      introMessage: START_GUIDE,
      commonQuestion: COMMON_QUESTION,
      imageSelections,
      toneAdjustment,
      completedAt: new Date().toISOString(),
    });
    onNext?.();
  };

  if (!hasStarted) {
    return (
      <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto flex flex-col">
        <DefaultTopBar onTitleClick={onHome} showNotification={false} />
        <BackButton onClick={handleHeaderBack} />

        <div className="mx-auto w-full max-w-[860px] flex-1 px-5 sm:px-8 lg:px-10 pt-8 pb-28 md:pb-8">
          <div className="inline-flex items-center rounded-full bg-black text-white px-3 py-1.5 font-['Noto_Sans_KR'] text-[12px] mb-4">
            선호 테스트 안내
          </div>
          <div className="rounded-[18px] bg-[#f7f7f7] border border-[#ececec] p-5">
            <p className="whitespace-pre-line font-['Noto_Sans_KR'] text-[14px] leading-[1.8] text-[#222]">{START_GUIDE}</p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent">
          <div className="mx-auto max-w-[860px] p-4 sm:p-5 lg:px-10 md:pt-2 md:pb-8">
            <button
              onClick={() => {
                setStepIndex(0);
                setHasStarted(true);
              }}
              className="w-full h-[52px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] text-[15px] font-semibold"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={handleHeaderBack} />

      <div className="mx-auto w-full max-w-[860px] flex-1 px-5 sm:px-8 lg:px-10 pt-4 pb-28 md:pb-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">
              {stepIndex + 1} / {TOTAL_STEPS}
            </p>
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">선택 완료 {selectedCount}/6</p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#efefef] overflow-hidden">
            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-4">
          <div className="inline-flex items-center rounded-full bg-black text-white px-3 py-1.5 font-['Noto_Sans_KR'] text-[12px] mb-2">
            {isToneStep ? "질문 7" : `질문 ${currentQuestion.number}`}
          </div>
          <h2 className="font-['NEXON_Football_Gothic'] text-[24px] text-black leading-[1.3] mb-1">
            {isToneStep ? "무보정 사진을 원하는 색감으로 보정해 주세요" : COMMON_QUESTION}
          </h2>
          {!isToneStep && (
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">이미지 수가 달라도 같은 정렬 규칙으로 보여집니다.</p>
          )}
        </div>

        {!isToneStep && currentQuestion && (
          <div className={`grid gap-3 ${getOptionGridClass(currentQuestion.options.length)}`}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionByQuestion[currentQuestion.number] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.number, option.id)}
                  className={`w-full rounded-[16px] overflow-hidden border-2 transition-all ${
                    isSelected ? "border-black shadow-md" : "border-[#e5e5e5] hover:border-[#bdbdbd]"
                  }`}
                >
                  <div className="aspect-[3/4] md:aspect-auto md:h-[210px] lg:h-[220px] bg-[#f2f2f2]">
                    <img src={option.src} alt={`question-${currentQuestion.number}-${option.id}`} className="w-full h-full object-cover" />
                  </div>
                  <div
                    className={`h-[36px] flex items-center justify-center font-['Noto_Sans_KR'] text-[12px] ${
                      isSelected ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {option.id}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isToneStep && (
          <div className="space-y-4">
            <div className="relative rounded-[20px] overflow-hidden border border-[#e5e5e5] bg-[#f4f4f4]">
              <div className="aspect-[3/4] md:aspect-auto md:h-[360px]">
                <img src={trait71} alt="tone-adjust-target" className="w-full h-full object-cover" style={imageFilterStyle} />
                <div className="absolute inset-0 mix-blend-color pointer-events-none" style={temperatureOverlayStyle} />
              </div>
            </div>

            <SliderField
              label="채도"
              value={toneAdjustment.saturation}
              onChange={(next) => setToneAdjustment((prev) => ({ ...prev, saturation: next }))}
            />
            <SliderField
              label="명도"
              value={toneAdjustment.brightness}
              onChange={(next) => setToneAdjustment((prev) => ({ ...prev, brightness: next }))}
            />
            <SliderField
              label="대비"
              value={toneAdjustment.contrast}
              onChange={(next) => setToneAdjustment((prev) => ({ ...prev, contrast: next }))}
            />
            <SliderField
              label="색 온도"
              value={toneAdjustment.temperature}
              onChange={(next) => setToneAdjustment((prev) => ({ ...prev, temperature: next }))}
            />

            <button
              onClick={() => setToneAdjustment(DEFAULT_TONE)}
              className="w-full h-[42px] rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#333] font-['Noto_Sans_KR'] text-[12px] font-medium inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              보정값 초기화
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent">
        <div className="mx-auto max-w-[860px] p-4 sm:p-5 lg:px-10 md:pt-2 md:pb-8">
          <button
            onClick={handleNextStep}
            disabled={!canGoNext}
            className="w-full h-[52px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] text-[15px] font-semibold disabled:opacity-45"
          >
            {isToneStep ? "선호 테스트 완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}



