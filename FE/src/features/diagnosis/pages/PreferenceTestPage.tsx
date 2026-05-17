import { useMemo, useState } from "react";
import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";
import { PreferenceImageQuestion } from "../components/preference/PreferenceImageQuestion";
import { PreferenceProgressHeader } from "../components/preference/PreferenceProgressHeader";
import { PreferenceStartPanel } from "../components/preference/PreferenceStartPanel";
import { PreferenceToneStep } from "../components/preference/PreferenceToneStep";
import type { ImageQuestion } from "../components/preference/types";
import {
  savePreferenceTestResult,
  type PreferenceImageSelection,
  type PreferenceToneAdjustment,
} from "../lib/preferenceTest";

interface PreferenceTestPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

const START_GUIDE = `잠시 후 여러 이미지가 순서대로 제시됩니다.

각 문항에서 지금 가장 끌리는 이미지 1개를
직감대로 바로 선택해 주세요.

선택한 결과는 페르소나 진단에 반영되어
더 정확한 스타일 제안에 활용됩니다.`;

const COMMON_QUESTION = "지금 가장 끌리는 이미지를 1개 선택해 주세요";
const imageSrc = (name: string) => `/images/${name}.png`;
const IMAGE_QUESTIONS: ImageQuestion[] = [
  {
    number: 1,
    options: [
      { id: "1-1", src: imageSrc("1-1") },
      { id: "1-2", src: imageSrc("1-2") },
      { id: "1-3", src: imageSrc("1-3") },
      { id: "1-4", src: imageSrc("1-4") },
    ],
  },
  {
    number: 2,
    options: [
      { id: "2-1", src: imageSrc("2-1") },
      { id: "2-2", src: imageSrc("2-2") },
    ],
  },
  {
    number: 3,
    options: [
      { id: "3-1", src: imageSrc("3-1") },
      { id: "3-2", src: imageSrc("3-2") },
    ],
  },
  {
    number: 4,
    options: [
      { id: "4-1", src: imageSrc("4-1") },
      { id: "4-2", src: imageSrc("4-2") },
    ],
  },
  {
    number: 5,
    options: [
      { id: "5-1", src: imageSrc("5-1") },
      { id: "5-2", src: imageSrc("5-2") },
    ],
  },
  {
    number: 6,
    options: [
      { id: "6-1", src: imageSrc("6-1") },
      { id: "6-2", src: imageSrc("6-2") },
      { id: "6-3", src: imageSrc("6-3") },
      { id: "6-4", src: imageSrc("6-4") },
      { id: "6-5", src: imageSrc("6-5") },
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

export function PreferenceTestPage({ onNext, onBack, onHome }: PreferenceTestPageProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionByQuestion, setSelectedOptionByQuestion] = useState<Record<number, string>>({});
  const [toneAdjustment, setToneAdjustment] = useState<PreferenceToneAdjustment>(DEFAULT_TONE);

  const isToneStep = stepIndex === TOTAL_STEPS - 1;
  const currentQuestion = IMAGE_QUESTIONS[stepIndex];

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
      selectedImageKey: `images/${selectedOptionByQuestion[question.number]}.png`,
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

  return (
    <DiagnosisPageLayout
      onBack={handleHeaderBack}
      onHome={onHome}
      scrollContent
      contentMaxWidthClassName="max-w-[1020px]"
      contentClassName="px-5 pb-28 pt-2 sm:px-8 md:pb-28 lg:px-10"
      bottomMaxWidthClassName="max-w-[1020px]"
      bottom={
        hasStarted ? (
          <div className="p-4 sm:p-5 md:px-10 md:pb-8 md:pt-2">
            <button
              onClick={handleNextStep}
              disabled={!canGoNext}
              className="h-[52px] w-full rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white disabled:opacity-45"
            >
              {isToneStep ? "선호 테스트 완료" : "다음"}
            </button>
          </div>
        ) : null
      }
    >
      {!hasStarted ? (
        <div className="pt-4">
          <PreferenceStartPanel
            guideText={START_GUIDE}
            onStart={() => {
              setStepIndex(0);
              setHasStarted(true);
            }}
          />
        </div>
      ) : (
        <>
          <PreferenceProgressHeader stepIndex={stepIndex} totalSteps={TOTAL_STEPS} selectedCount={selectedCount} />

          <div className="mb-4">
            <div className="mb-2 inline-flex items-center rounded-full bg-black px-3 py-1.5 font-['Noto_Sans_KR'] text-[12px] text-white">
              {isToneStep ? "질문 7" : `질문 ${currentQuestion.number}`}
            </div>
            <h2 className="mb-1 font-['NEXON_Football_Gothic'] text-[24px] leading-[1.3] text-black">
              {isToneStep ? "샘플 사진을 취향에 맞게 조절해 주세요" : COMMON_QUESTION}
            </h2>
            {!isToneStep ? (
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">
                생각하지 말고, 눈에 가장 먼저 끌리는 이미지를 선택해 주세요.
              </p>
            ) : null}
          </div>

          {!isToneStep && currentQuestion ? (
            <PreferenceImageQuestion
              question={currentQuestion}
              selectedOptionId={selectedOptionByQuestion[currentQuestion.number]}
              onSelect={handleSelectOption}
            />
          ) : null}

          {isToneStep ? (
            <PreferenceToneStep
              toneImageSrc={imageSrc("6-1")}
              toneAdjustment={toneAdjustment}
              imageFilterStyle={imageFilterStyle}
              temperatureOverlayStyle={temperatureOverlayStyle}
              onChangeTone={(key, value) => setToneAdjustment((prev) => ({ ...prev, [key]: value }))}
              onReset={() => setToneAdjustment(DEFAULT_TONE)}
            />
          ) : null}
        </>
      )}
    </DiagnosisPageLayout>
  );
}
