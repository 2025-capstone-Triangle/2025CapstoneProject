import { useMemo, useState } from "react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import {
  buildDiagnosisPreferencePayload,
  getPreferenceTestResult,
  stageDiagnosisPreferencePayload,
} from "../lib/preferenceTest";
import { getStagedDiagnosisImageFiles } from "../lib/imageStaging";
import { getStagedVoiceRecordingMeta } from "../lib/voiceRecording";

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

    console.info("[diagnosis.preference.payload]", payload);
    setStagedMessage("분석 요청 데이터가 준비되었습니다.");
    void onConfirm?.();
  };

  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="mx-auto w-full max-w-[760px] flex-1 px-5 sm:px-8 lg:px-10 pt-8 pb-28 md:pb-8">
        <h2 className="font-['NEXON_Football_Gothic'] text-[28px] text-black mb-6">입력 내용 확인</h2>

        <div className="space-y-3 mb-8">
          <div className="rounded-[16px] bg-[#f8f8f8] p-5 border border-[#ececec]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Noto_Sans_KR'] text-[15px] text-black font-semibold">선호 테스트</h3>
              <span className="font-['Noto_Sans_KR'] text-[12px] text-[#EF466F] font-semibold">
                {preferenceResult ? "완료" : "미완료"}
              </span>
            </div>
            {preferenceResult ? (
              <div className="space-y-1">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                  이미지 선택: {preferenceResult.imageSelections.length}문항
                </p>
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                  채도 {preferenceResult.toneAdjustment.saturation} / 명도 {preferenceResult.toneAdjustment.brightness}
                </p>
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                  대비 {preferenceResult.toneAdjustment.contrast} / 색 온도 {preferenceResult.toneAdjustment.temperature}
                </p>
              </div>
            ) : (
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">결과가 저장되지 않았습니다.</p>
            )}
          </div>

          <div className="rounded-[16px] bg-[#f8f8f8] p-5 border border-[#ececec]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Noto_Sans_KR'] text-[15px] text-black font-semibold">이미지 분석</h3>
              <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold text-[#EF466F]">
                {imageFile ? "완료" : "미완료"}
              </span>
            </div>
            {imageFile ? (
              <div className="space-y-1">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] break-all">{imageFile.name}</p>
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">{(imageFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">이미지를 업로드해 주세요.</p>
            )}
          </div>

          <div className="rounded-[16px] bg-[#f8f8f8] p-5 border border-[#ececec]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-['Noto_Sans_KR'] text-[15px] text-black font-semibold">음성 분석</h3>
              <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold text-[#EF466F]">
                {voiceMeta ? "완료" : "미완료"}
              </span>
            </div>
            {voiceMeta ? (
              <div className="space-y-1">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] break-all">{voiceMeta.fileName}</p>
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">
                  {voiceMeta.durationSec}초 / {(voiceMeta.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">음성을 녹음해 주세요.</p>
            )}
          </div>
        </div>

        <div className="rounded-[16px] bg-[#f0f7ff] border border-[#d8e9ff] p-5 mb-4">
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#1a4d8f] leading-[1.7]">
            확인 버튼을 누르면 현재 입력값으로 분석을 시작합니다.
          </p>
        </div>

        {submitError && <p className="font-['Noto_Sans_KR'] text-[12px] text-[#d92d20] mb-2">{submitError}</p>}
        {stagedMessage && <p className="font-['Noto_Sans_KR'] text-[12px] text-[#0f9f53] mb-2">{stagedMessage}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent">
        <div className="mx-auto max-w-[760px] p-4 sm:p-6 lg:px-10 md:pt-2 md:pb-8">
          <button
            onClick={handleConfirm}
            className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm hover:bg-[#1a1a1a] transition-colors"
          >
            확인하고 분석 시작
          </button>
        </div>
      </div>
    </div>
  );
}


