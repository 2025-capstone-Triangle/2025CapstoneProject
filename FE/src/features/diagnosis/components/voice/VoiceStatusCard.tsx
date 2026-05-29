import type { ReactNode } from "react";
import { CheckCircle2, Circle, Pause, Play, RefreshCw, Square, Mic } from "lucide-react";
import type { StagedVoiceRecordingMeta } from "../../lib/voiceRecording";

interface WaveformBar {
  barHeight: number;
  opacity: number;
}

interface VoiceStatusCardProps {
  sampleScript: string;
  hasRecording: boolean;
  recordingMeta: StagedVoiceRecordingMeta | null;
  isRecorderStopping: boolean;
  statusText: string;
  error: string | null;
  recordingTimeLabel: string;
  maxTimeLabel: string;
  progressPercent: number;
  waveformBars: WaveformBar[];
  isRecording: boolean;
  isPaused: boolean;
  isPlaybackPlaying: boolean;
  playbackCurrentLabel: string;
  playbackDurationLabel: string;
  playbackMax: number;
  playbackValue: number;
  playbackEnabled: boolean;
  onRecordToggle: () => void;
  onPauseResume: () => void;
  onRetry: () => void;
  onDownload: () => void;
  onTogglePlayback: () => void;
  onSeekPlayback: (value: number) => void;
  isPauseDisabled: boolean;
  isRecordDisabled: boolean;
  children?: ReactNode;
}

export function VoiceStatusCard({
  sampleScript,
  hasRecording,
  recordingMeta,
  isRecorderStopping,
  statusText,
  error,
  recordingTimeLabel,
  maxTimeLabel,
  progressPercent,
  waveformBars,
  isRecording,
  isPaused,
  isPlaybackPlaying,
  playbackCurrentLabel,
  playbackDurationLabel,
  playbackMax,
  playbackValue,
  playbackEnabled,
  onRecordToggle,
  onPauseResume,
  onRetry,
  onDownload,
  onTogglePlayback,
  onSeekPlayback,
  isPauseDisabled,
  isRecordDisabled,
  children,
}: VoiceStatusCardProps) {
  return (
    <>
      {error ? (
        <div className="mb-4 rounded-[14px] border border-[#ffd3d1] bg-[#fff3f2] px-4 py-3">
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b]">{error}</p>
        </div>
      ) : null}

      <div className="mb-4 rounded-[20px] border border-[#efefef] bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.04)] sm:p-5 lg:mb-0 lg:min-h-[100%]">
        <div className="mb-4 rounded-[14px] bg-gradient-to-r from-[#fafafa] to-[#f6f6f6] px-4 py-3.5">
          <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold leading-[1.55] text-[#4b5563]">
            아래 문장을 읽어주세요.
          </p>
          <p className="mt-2 rounded-[10px] bg-white px-3 py-2 font-['Noto_Sans_KR'] text-[13px] font-semibold leading-[1.6] text-[#1f2937]">
            "{sampleScript}"
          </p>
          <div className="mt-2 space-y-1">
            <p className="flex items-start gap-1.5 font-['Noto_Sans_KR'] text-[12px] leading-[1.55] text-[#6b7280]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
              소음이 적은 곳에서 또렷한 목소리로 녹음해 주세요.
            </p>
            <p className="flex items-start gap-1.5 font-['Noto_Sans_KR'] text-[12px] leading-[1.55] text-[#6b7280]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
              원하는 문장으로 자유롭게 녹음해도 됩니다.
            </p>
          </div>
        </div>

        {hasRecording && recordingMeta ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-[#333]">녹음 상태</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#effaf3] px-2.5 py-1">
                <Circle className="h-2.5 w-2.5 fill-[#199a58] text-[#199a58]" />
                <span className="font-['Noto_Sans_KR'] text-[11px] text-[#199a58]">녹음 완료</span>
              </div>
            </div>

            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-['NEXON_Football_Gothic'] text-[clamp(24px,3.2vw,28px)] text-black">{recordingTimeLabel}</p>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#888]">/ {maxTimeLabel}</p>
            </div>

            <p className="mb-1 break-all font-['Noto_Sans_KR'] text-[12px] text-[#666]">{recordingMeta.fileName}</p>
            <div className="mb-3">
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">파일 크기: {(recordingMeta.size / 1024).toFixed(1)} KB</p>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">총 길이: {recordingTimeLabel}</p>
            </div>

            {playbackEnabled ? (
              <div className="rounded-[12px] border border-[#ececec] bg-[#fafafa] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onTogglePlayback}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
                  >
                    {isPlaybackPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <p className="font-['Noto_Sans_KR'] text-[12px] text-[#555]">
                    {playbackCurrentLabel} / {playbackDurationLabel}
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(playbackMax, 1)}
                  value={Math.min(playbackValue, playbackMax)}
                  onChange={(event) => onSeekPlayback(Number(event.target.value))}
                  className="w-full accent-[#EF466F]"
                />
              </div>
            ) : null}

            <p className="mt-3 font-['Noto_Sans_KR'] text-[12px] text-[#586174]">
              녹음이 정상입니다. 재생으로 확인한 뒤 하단의 "녹음 완료로 다음 단계" 버튼을 눌러주세요.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-[12px] border border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] text-[#222] hover:bg-[#fafafa]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                다시 녹음하기
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="h-[42px] rounded-[12px] border border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] text-[#222] hover:bg-[#fafafa]"
              >
                파일 다운로드
              </button>
            </div>
          </>
        ) : isRecorderStopping ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-[#333]">녹음 상태</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f6f6] px-2.5 py-1">
                <Circle className="h-2.5 w-2.5 fill-[#EF466F] text-[#EF466F]" />
                <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b6b6b]">{statusText}</span>
              </div>
            </div>
            <div className="flex h-[122px] flex-col items-center justify-center text-center">
              <p className="mb-1 font-['Noto_Sans_KR'] text-[15px] font-semibold text-[#EF466F]">녹음 파일을 정리하고 있어요.</p>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">잠시만 기다리면 자동으로 완료됩니다.</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-[#333]">녹음 상태</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f6f6] px-2.5 py-1">
                <Circle
                  className={`h-2.5 w-2.5 ${
                    isRecording && !isPaused ? "fill-[#EF466F] text-[#EF466F]" : "fill-[#bcbcbc] text-[#bcbcbc]"
                  }`}
                />
                <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b6b6b]">{statusText}</span>
              </div>
            </div>

            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-['NEXON_Football_Gothic'] text-[clamp(24px,3.6vw,30px)] text-black">{recordingTimeLabel}</p>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#888]">/ {maxTimeLabel}</p>
            </div>

            <div className="mb-4 h-[8px] overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#EF466F] to-[#ff7a93] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mb-3 flex h-[46px] items-end justify-center gap-[3px]">
              {waveformBars.map((bar, index) => {
                const isCenter = index > 10 && index < 22;
                const width = isCenter ? 4 : 3;
                return (
                  <div
                    key={`voice-bar-${index}`}
                    className="rounded-full bg-[#EF466F] transition-all duration-100"
                    style={{ width: `${width}px`, height: `${bar.barHeight}px`, opacity: bar.opacity }}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRecordToggle}
                disabled={isRecordDisabled}
                className={`inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] font-['Noto_Sans_KR'] text-[14px] font-semibold transition-colors disabled:opacity-50 ${
                  isRecording || isPaused
                    ? "bg-[#111] text-white hover:bg-black"
                    : "bg-[#EF466F] text-white hover:bg-[#de3c66]"
                }`}
              >
                {isRecording || isPaused ? <Square className="h-4 w-4 fill-white" /> : <Mic className="h-4 w-4" />}
                {isRecording || isPaused ? "녹음 완료하기" : "녹음 시작하기"}
              </button>
              <button
                type="button"
                onClick={onPauseResume}
                disabled={isPauseDisabled}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#dedede] bg-white font-['Noto_Sans_KR'] text-[14px] font-semibold text-[#222] hover:bg-[#f8f8f8] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "이어 녹음" : "잠시 멈춤"}
              </button>
            </div>
          </>
        )}
      </div>
      {children}
    </>
  );
}
