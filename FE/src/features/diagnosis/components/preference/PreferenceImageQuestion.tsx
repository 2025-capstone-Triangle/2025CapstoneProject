import type { ImageQuestion } from "./types";

interface PreferenceImageQuestionProps {
  question: ImageQuestion;
  selectedOptionId?: string;
  onSelect: (questionNumber: number, optionId: string) => void;
}

function getOptionGridClass(optionCount: number) {
  if (optionCount <= 2) return "grid-cols-2 max-w-[700px] mx-auto";
  if (optionCount === 4) return "grid-cols-2 lg:grid-cols-4 max-w-[980px] mx-auto";
  if (optionCount >= 5) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1060px] mx-auto";
  return "grid-cols-2";
}

function getImageFrameClass(optionCount: number) {
  if (optionCount <= 2) return "aspect-[3/4]";
  if (optionCount >= 5) return "aspect-[3/4]";
  return "aspect-[3/4]";
}

export function PreferenceImageQuestion({
  question,
  selectedOptionId,
  onSelect,
}: PreferenceImageQuestionProps) {
  const optionCount = question.options.length;
  const imageObjectClass = question.number === 1 ? "object-cover" : "object-contain bg-[#f6f6f6]";

  return (
    <div className={`grid gap-3 ${getOptionGridClass(optionCount)}`}>
      {question.options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(question.number, option.id)}
            className={`w-full overflow-hidden rounded-[16px] border-2 transition-all ${
              isSelected ? "border-black shadow-md" : "border-[#e5e5e5] hover:border-[#bdbdbd]"
            }`}
          >
            <div className={`bg-[#f2f2f2] ${getImageFrameClass(optionCount)}`}>
              <img
                src={option.src}
                alt={`question-${question.number}-${option.id}`}
                className={`h-full w-full ${imageObjectClass}`}
              />
            </div>
            <div
              className={`flex h-[36px] items-center justify-center font-['Noto_Sans_KR'] text-[12px] ${
                isSelected ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {option.id}
            </div>
          </button>
        );
      })}
    </div>
  );
}
