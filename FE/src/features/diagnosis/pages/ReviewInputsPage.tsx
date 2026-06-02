import { useMemo, useState } from "react";
import {
  buildDiagnosisPreferencePayload,
  getPreferenceTestResult,
  stageDiagnosisPreferencePayload,
} from "../lib/preferenceTest";
import { getStagedDiagnosisImageFiles } from "../lib/imageStaging";
import { getStagedVoiceRecordingMeta } from "../lib/voiceRecording";
import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";
import { InputReviewCard } from "../components/review/InputReviewCard";

interface ReviewInputsPageProps {
  onConfirm?: () => void | Promise<void>;
  onBack?: () => void;
  onHome?: () => void;
}

export function ReviewInputsPage({ onConfirm, onBack, onHome }: ReviewInputsPageProps) {
  const [submitError, setSubmitError] = useState("");
  const [stagedMessage, setStagedMessage] = useState("");

  const preferenceResult = useMemo(() => getPreferenceTestResult(), []);
  const imageFile = useMemo(() => getStagedDiagnosisImageFiles()[0] ?? null, []);
  const voiceMeta = useMemo(() => getStagedVoiceRecordingMeta(), []);

  const handleConfirm = () => {
    setSubmitError("");
    setStagedMessage("");

    if (!preferenceResult) {
      setSubmitError("선호 테스트 결과가 없습니다. 테스트를 먼저 완료해 주세요.");
      return;
    }
    if (!imageFile) {
      setSubmitError("이미지 업로드가 필요합니다. 이미지 단계를 완료해 주세요.");
      return;
    }
    if (!voiceMeta) {
      setSubmitError("음성 녹음이 필요합니다. 음성 단계를 완료해 주세요.");
      return;
    }

    const payload = buildDiagnosisPreferencePayload(preferenceResult);
    stageDiagnosisPreferencePayload(payload);
    setStagedMessage("분석 요청 데이터가 준비되었습니다.");
    void onConfirm?.();
  };

  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[1120px]"
      contentClassName="px-5 pb-28 pt-3 sm:px-8 sm:pt-4 md:pb-28 lg:px-10"
      bottomMaxWidthClassName="max-w-[1120px]"
      bottom={
        <div className="p-4 sm:p-6 md:px-10 md:pb-8 md:pt-2">
          <button
            onClick={handleConfirm}
            className="flex h-[56px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a]"
          >
            확인하고 분석 시작
          </button>
        </div>
      }
    >
      <h2 className="mb-2 font-['NEXON_Football_Gothic'] text-[28px] text-black">입력 내용 확인</h2>
      <p className="mb-5 font-['Noto_Sans_KR'] text-[13px] text-[#6b7280]">
        분석 요청 전에 업로드된 정보와 테스트 결과를 최종 확인해 주세요.
      </p>

      <div className="space-y-3">
        <div className="rounded-[16px] border border-[#d8e9ff] bg-[#f0f7ff] p-5">
          <p className="font-['Noto_Sans_KR'] text-[13px] leading-[1.7] text-[#1a4d8f]">
            확인 버튼을 누르면 현재 입력값으로 페르소나 분석이 시작됩니다. 분석 중에는 페이지를 닫지 말아 주세요.
          </p>
        </div>

        <InputReviewCard title="선호 테스트" done={Boolean(preferenceResult)}>
          {preferenceResult ? (
            <div className="space-y-1">
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                이미지 선택: {preferenceResult.imageSelections.length}문항
              </p>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                채도 {preferenceResult.toneAdjustment.saturation} / 명도 {preferenceResult.toneAdjustment.brightness}
              </p>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                대비 {preferenceResult.toneAdjustment.contrast} / 온도 {preferenceResult.toneAdjustment.temperature}
              </p>
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">결과가 저장되지 않았습니다.</p>
          )}
        </InputReviewCard>

        <InputReviewCard title="이미지 분석" done={Boolean(imageFile)}>
          {imageFile ? (
            <div className="space-y-1">
              <p className="break-all font-['Noto_Sans_KR'] text-[13px] text-[#666]">{imageFile.name}</p>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">{(imageFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">이미지를 업로드해 주세요.</p>
          )}
        </InputReviewCard>

        <InputReviewCard title="음성 분석" done={Boolean(voiceMeta)}>
          {voiceMeta ? (
            <div className="space-y-1">
              <p className="break-all font-['Noto_Sans_KR'] text-[13px] text-[#666]">{voiceMeta.fileName}</p>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                {voiceMeta.durationSec}초 / {(voiceMeta.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">음성을 녹음해 주세요.</p>
          )}
        </InputReviewCard>

        {submitError ? <p className="mb-2 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{submitError}</p> : null}
        {stagedMessage ? <p className="mb-2 font-['Noto_Sans_KR'] text-[12px] text-[#0f9f53]">{stagedMessage}</p> : null}
      </div>
    </DiagnosisPageLayout>
  );
}
