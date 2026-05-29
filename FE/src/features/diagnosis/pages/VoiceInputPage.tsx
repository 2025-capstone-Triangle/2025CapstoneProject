import { useEffect, useState } from "react";
import { Mic, Shield } from "lucide-react";
import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";
import { VoiceGuideCard } from "../components/voice/VoiceGuideCard";
import { VoiceNextActionBar } from "../components/voice/VoiceNextActionBar";
import { VoiceStatusCard } from "../components/voice/VoiceStatusCard";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

interface VoiceInputPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

const SAMPLE_SCRIPT = "안녕하세요, 반갑습니다. 오늘 날씨가 정말 좋네요.";

export function VoiceInputPage({ onNext, onBack, onHome }: VoiceInputPageProps) {
  const voice = useVoiceRecorder({ maxRecordingSeconds: 90 });

  const [showPreRecordGuide, setShowPreRecordGuide] = useState(false);
  const [showDeniedGuide, setShowDeniedGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<"android" | "ios">("android");

  useEffect(() => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setGuideTab("ios");
    }
  }, []);

  useEffect(() => {
    if (voice.microphonePermission === "denied") {
      setShowDeniedGuide(true);
    }
  }, [voice.microphonePermission]);

  const handleRecordClick = () => {
    if (voice.isRecording || voice.isPaused || voice.isRecorderStopping) {
      void voice.handleRecordToggle();
      return;
    }
    if (voice.microphonePermission === "denied") {
      setShowDeniedGuide(true);
      return;
    }
    if (voice.microphonePermission === "prompt" || voice.microphonePermission === "unknown") {
      setShowPreRecordGuide(true);
      return;
    }
    void voice.handleRecordToggle();
  };

  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[1120px]"
      contentClassName="px-5 pb-28 pt-3 sm:px-8 sm:pt-4 md:pb-28 lg:px-10"
      bottomMaxWidthClassName="max-w-[1120px]"
      bottomWrapperClassName="bg-white/95 backdrop-blur"
      bottom={
        <VoiceNextActionBar
          hasRecording={voice.hasRecording}
          disabled={!voice.canProceed}
          isRecording={voice.isRecording || voice.isPaused}
          isRecorderStopping={voice.isRecorderStopping}
          onNext={onNext}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <VoiceGuideCard
          permissionState={voice.microphonePermission}
          permissionLabel={voice.permissionGuide}
          maxTimeLabel={voice.maxTimeLabel}
        />

        <VoiceStatusCard
          sampleScript={SAMPLE_SCRIPT}
          hasRecording={voice.hasRecording}
          recordingMeta={voice.recordingMeta}
          isRecorderStopping={voice.isRecorderStopping}
          statusText={voice.statusText}
          error={voice.error}
          recordingTimeLabel={voice.recordingTimeLabel}
          maxTimeLabel={voice.maxTimeLabel}
          progressPercent={voice.progressPercent}
          waveformBars={voice.waveformBars}
          isRecording={voice.isRecording}
          isPaused={voice.isPaused}
          isPlaybackPlaying={voice.isPlaybackPlaying}
          playbackCurrentLabel={voice.playbackCurrentLabel}
          playbackDurationLabel={voice.playbackDurationLabel}
          playbackMax={voice.playbackDurationSec}
          playbackValue={voice.playbackCurrentSec}
          playbackEnabled={Boolean(voice.playbackUrl)}
          onRecordToggle={handleRecordClick}
          onPauseResume={voice.handlePauseResume}
          onRetry={voice.handleRetryRecording}
          onDownload={voice.handleDownloadVoice}
          onTogglePlayback={voice.togglePlayback}
          onSeekPlayback={voice.seekPlayback}
          isPauseDisabled={!voice.isRecording || voice.isRecorderStopping}
          isRecordDisabled={voice.isRecorderStopping}
        >
          {voice.playbackUrl ? (
            <audio ref={voice.playbackAudioRef} src={voice.playbackUrl} preload="metadata" className="hidden" />
          ) : null}
        </VoiceStatusCard>
      </div>

      {/* 팝업 1: 녹음 전 권한 요청 안내 */}
      {showPreRecordGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-5">
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-2xl border border-[#ececec]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#eef6ff] flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5 text-[#2563eb]" />
              </div>
              <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">마이크 권한 허용 필요</p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#555] leading-[1.7] mb-2">
              잠시 후 마이크 권한 요청 창이 뜹니다.
            </p>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#333] font-semibold leading-[1.7] mb-5">
              반드시 <span className="text-[#2563eb]">'허용'</span>을 눌러주세요.<br />
              거부하면 녹음을 다시 시도하기 어렵습니다.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowPreRecordGuide(false);
                  void voice.handleRecordToggle();
                }}
                className="w-full h-[48px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] font-semibold text-[14px]"
              >
                확인, 녹음 시작하기
              </button>
              <button
                onClick={() => setShowPreRecordGuide(false)}
                className="w-full h-[44px] rounded-[12px] bg-[#f7f7f7] text-[#555] font-['Noto_Sans_KR'] text-[13px]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 2: 권한 거부 후 설정 안내 */}
      {showDeniedGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-5">
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-2xl border border-[#ececec]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#fff3f5] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#EF466F]" />
              </div>
              <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">마이크 권한이 거부됐어요</p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#555] leading-[1.6] mb-4">
              브라우저 설정에서 마이크 권한을 직접 허용해 주세요.
            </p>

            {/* OS 탭 */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setGuideTab("android")}
                className={`flex-1 h-[34px] rounded-[10px] font-['Noto_Sans_KR'] text-[12px] font-semibold transition-colors ${
                  guideTab === "android"
                    ? "bg-black text-white"
                    : "bg-[#f3f4f6] text-[#666]"
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setGuideTab("ios")}
                className={`flex-1 h-[34px] rounded-[10px] font-['Noto_Sans_KR'] text-[12px] font-semibold transition-colors ${
                  guideTab === "ios"
                    ? "bg-black text-white"
                    : "bg-[#f3f4f6] text-[#666]"
                }`}
              >
                iPhone / iPad
              </button>
            </div>

            {guideTab === "android" ? (
              <ol className="space-y-1.5 mb-5">
                {[
                  "주소창 왼쪽 🔒 자물쇠 아이콘 탭",
                  "권한 → 마이크 → 허용 선택",
                  "페이지를 새로고침 후 다시 시도",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] font-['Noto_Sans_KR'] text-[11px] font-bold text-[#555]">
                      {i + 1}
                    </span>
                    <span className="font-['Noto_Sans_KR'] text-[13px] text-[#333] leading-[1.6]">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="space-y-1.5 mb-5">
                {[
                  "iPhone 설정 앱 열기",
                  "Safari (또는 사용 중인 브라우저) 선택",
                  "마이크 → 허용 선택 후 앱으로 복귀",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] font-['Noto_Sans_KR'] text-[11px] font-bold text-[#555]">
                      {i + 1}
                    </span>
                    <span className="font-['Noto_Sans_KR'] text-[13px] text-[#333] leading-[1.6]">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <button
              onClick={() => setShowDeniedGuide(false)}
              className="w-full h-[48px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] font-semibold text-[14px]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </DiagnosisPageLayout>
  );
}
