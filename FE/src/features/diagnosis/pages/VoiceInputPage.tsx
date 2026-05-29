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
          onRecordToggle={voice.handleRecordToggle}
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
    </DiagnosisPageLayout>
  );
}
