import { useState } from "react";
import { ContentBottomActionBar } from "../components/ContentBottomActionBar";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { ContentSectionHeader } from "../components/ContentSectionHeader";
import { RatioOptionCard } from "../components/RatioOptionCard";

interface ContentAspectRatioPageProps {
  onNext?: (ratio: string) => void;
  onBack?: () => void;
  onHome?: () => void;
  skipPersonaSelection?: boolean;
}

const ratios = [
  {
    id: "1:1",
    label: "1:1",
    description: "정사각형",
    detail: "프로필 이미지에 적합",
    aspectClass: "aspect-square",
  },
  {
    id: "4:5",
    label: "4:5",
    description: "세로형",
    detail: "인스타그램 피드 게시물에 적합",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "9:16",
    label: "9:16",
    description: "세로 스토리",
    detail: "인스타그램 스토리에 적합",
    aspectClass: "aspect-[9/16]",
  },
];

export function ContentAspectRatioPage({ onNext, onBack, onHome, skipPersonaSelection }: ContentAspectRatioPageProps) {
  const [selectedRatio, setSelectedRatio] = useState<string>("4:5");

  return (
    <ContentPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[980px]"
      contentClassName="px-4 pb-28 pt-2 sm:px-8 md:px-10 md:pb-8"
      bottomMaxWidthClassName="max-w-[980px]"
      bottom={
        <ContentBottomActionBar
          label={skipPersonaSelection ? "바로 생성하기" : "다음"}
          onClick={() => onNext?.(selectedRatio)}
        />
      }
    >
      <ContentSectionHeader title="콘텐츠 비율 선택" description="생성할 콘텐츠의 비율을 선택해 주세요." />

      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {ratios.map((ratio) => (
          <RatioOptionCard
            key={ratio.id}
            ratio={ratio}
            selected={selectedRatio === ratio.id}
            onSelect={setSelectedRatio}
          />
        ))}
      </div>
    </ContentPageLayout>
  );
}

